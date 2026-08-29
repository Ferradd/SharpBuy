using System;
using System.Drawing;
using System.IO;
using System.Runtime.InteropServices;
using System.Windows.Forms;
using Microsoft.Web.WebView2.Core;
using Microsoft.Web.WebView2.WinForms;

namespace SharpBuy_Launcher
{
    public class MainForm : Form
    {
        private WebView2 _webView;
        private SteamManager _steamManager;
        private WebBridge _bridge;

        [DllImport("user32.dll")]
        public static extern int SendMessage(IntPtr hWnd, int Msg, int wParam, int lParam);
        [DllImport("user32.dll")]
        public static extern bool ReleaseCapture();

        public const int WM_NCLBUTTONDOWN = 0xA1;
        public const int HT_CAPTION = 0x2;

        public MainForm()
        {
            InitializeComponent();
            _steamManager = new SteamManager();
            _bridge = new WebBridge(this, _steamManager);
            InitWebView();
        }

        private void InitializeComponent()
        {
            this.SuspendLayout();
            this.ClientSize = new Size(600, 440);
            this.FormBorderStyle = FormBorderStyle.None;
            this.StartPosition = FormStartPosition.CenterScreen;
            this.BackColor = Color.FromArgb(17, 20, 26);
            this.Text = "SHARPBUY NFA LAUNCHER";
            this.ShowIcon = true;
            
            try
            {
                string iconPath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "Assets", "icon.ico");
                if (File.Exists(iconPath)) this.Icon = new Icon(iconPath);
            }
            catch { }

            _webView = new WebView2
            {
                Dock = DockStyle.Fill,
                DefaultBackgroundColor = Color.FromArgb(17, 20, 26)
            };

            this.Controls.Add(_webView);
            this.ResumeLayout(false);
        }

        private async void InitWebView()
        {
            try
            {
                string userDataFolder = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "SharpBuy_Launcher", "WebView2Data");
                var env = await CoreWebView2Environment.CreateAsync(null, userDataFolder);
                await _webView.EnsureCoreWebView2Async(env);

                _webView.CoreWebView2.Settings.IsStatusBarEnabled = false;
                _webView.CoreWebView2.Settings.AreDevToolsEnabled = false;
                _webView.CoreWebView2.Settings.AreDefaultContextMenusEnabled = false;
                _webView.CoreWebView2.Settings.IsZoomControlEnabled = false;

                // Add Host Object for JS Bridge
                _webView.CoreWebView2.AddHostObjectToScript("bridge", _bridge);

                string htmlContent = "";
                var assembly = typeof(MainForm).Assembly;
                using (var stream = assembly.GetManifestResourceStream("SharpBuy_Launcher.Assets.index.html"))
                {
                    if (stream != null)
                    {
                        using var reader = new StreamReader(stream, System.Text.Encoding.UTF8);
                        htmlContent = reader.ReadToEnd();
                    }
                }

                if (!string.IsNullOrEmpty(htmlContent))
                {
                    _webView.CoreWebView2.NavigateToString(htmlContent);
                }
                else
                {
                    string htmlPath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "Assets", "index.html");
                    if (File.Exists(htmlPath))
                    {
                        _webView.CoreWebView2.Navigate(new Uri(htmlPath).AbsoluteUri);
                    }
                    else
                    {
                        _webView.CoreWebView2.NavigateToString("<h2 style='color:white;font-family:sans-serif;padding:20px;'>Assets/index.html not found</h2>");
                    }
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Failed to initialize WebView2: {ex.Message}", "SharpBuy Launcher Error", MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
        }

        public void SetWindowSize(int width, int height)
        {
            if (this.InvokeRequired)
            {
                this.Invoke(() => this.ClientSize = new Size(width, height));
            }
            else
            {
                this.ClientSize = new Size(width, height);
            }
        }

        public Task SetWindowSizeAnimated(int width, int height, int durationMs = 320)
        {
            var tcs = new TaskCompletionSource<bool>();

            void Run()
            {
                if (ClientSize.Width == width && ClientSize.Height == height)
                {
                    tcs.TrySetResult(true);
                    return;
                }

                var start = ClientSize;
                var target = new Size(width, height);
                int steps = Math.Max(14, durationMs / 16);
                int step = 0;
                var timer = new System.Windows.Forms.Timer { Interval = Math.Max(8, durationMs / steps) };

                timer.Tick += (_, _) =>
                {
                    step++;
                    double t = Math.Min(1.0, step / (double)steps);
                    t = 1 - Math.Pow(1 - t, 3);
                    int w = start.Width + (int)((target.Width - start.Width) * t);
                    int h = start.Height + (int)((target.Height - start.Height) * t);
                    ClientSize = new Size(w, h);

                    if (step >= steps)
                    {
                        timer.Stop();
                        timer.Dispose();
                        ClientSize = target;
                        tcs.TrySetResult(true);
                    }
                };

                timer.Start();
            }

            if (InvokeRequired)
                BeginInvoke(Run);
            else
                Run();

            return tcs.Task;
        }

        public void StartDrag()
        {
            ReleaseCapture();
            SendMessage(this.Handle, WM_NCLBUTTONDOWN, HT_CAPTION, 0);
        }

        public void ExecuteScript(string script)
        {
            if (_webView != null && _webView.CoreWebView2 != null)
            {
                _webView.CoreWebView2.ExecuteScriptAsync(script);
            }
        }
    }
}
