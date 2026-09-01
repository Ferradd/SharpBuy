using System;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.IO;
using System.Linq;
using System.Runtime.InteropServices;
using System.Threading.Tasks;
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

        [DllImport("user32.dll")]
        public static extern bool AnimateWindow(IntPtr hWnd, int dwTime, int dwFlags);

        private const int AW_HIDE = 0x10000;
        private const int AW_BLEND = 0x00080000;
        private const int AW_VER_NEGATIVE = 0x00000008;

        private const int WidthNormal = 620;
        private const int HeightNormal = 480;
        private const int HeightPassport = 650;
        private const int ShellPad = 10;
        private const int PanelGap = 12;
        private const int PanelW = 600;
        private const int DrawerW = 380;
        private const int CornerRadius = 14;
        private const int CardHNormal = 460;
        private const int CardHTall = 630;
        private static readonly Color ShellBackground = Color.FromArgb(12, 15, 23);

        private float DpiScale => DeviceDpi / 96f;

        private int S(int value) => Math.Max(1, (int)Math.Round(value * DpiScale));

        private static void AddRoundedRect(GraphicsPath path, Rectangle bounds, int radius)
        {
            if (bounds.Width <= 0 || bounds.Height <= 0) return;

            int r = Math.Min(radius, Math.Min(bounds.Width, bounds.Height) / 2);
            int d = r * 2;
            path.AddArc(bounds.X, bounds.Y, d, d, 180, 90);
            path.AddArc(bounds.Right - d, bounds.Y, d, d, 270, 90);
            path.AddArc(bounds.Right - d, bounds.Bottom - d, d, d, 0, 90);
            path.AddArc(bounds.X, bounds.Bottom - d, d, d, 90, 90);
            path.CloseFigure();
        }

        private void ApplyWindowRegion(int width, int height, int layoutMode = 0)
        {
            Region? previous = Region;
            try
            {
                int shellPad = S(ShellPad);
                int panelGap = S(PanelGap);
                int panelW = S(PanelW);
                int drawerW = S(DrawerW);
                int cornerRadius = S(CornerRadius);
                int widthNormal = S(WidthNormal);

                bool isTallMode = layoutMode == 1;
                bool drawerOpen = width > widthNormal + S(40);
                
                int maxInnerH = Math.Max(0, height - shellPad * 2);
                int targetLeftH = isTallMode ? S(CardHTall) : S(CardHNormal);
                int leftH = Math.Min(targetLeftH, maxInnerH);
                int rightH = maxInnerH;

                using var path = new GraphicsPath { FillMode = FillMode.Winding };

                // 1. Left Card - EXACT bounds
                if (leftH > cornerRadius)
                {
                    var leftRect = new Rectangle(shellPad, shellPad, panelW, leftH);
                    AddRoundedRect(path, leftRect, cornerRadius);
                }

                // 2. Right Drawer Card (if open) - EXACT bounds
                if (drawerOpen && rightH > cornerRadius)
                {
                    int rightX = shellPad + panelW + panelGap;
                    int rightW = Math.Min(drawerW, width - rightX - shellPad);
                    if (rightW > 0)
                    {
                        var rightRect = new Rectangle(rightX, shellPad, rightW, rightH);
                        AddRoundedRect(path, rightRect, cornerRadius);
                    }
                }

                Region = new Region(path);
            }
            finally
            {
                previous?.Dispose();
            }
        }

        public MainForm()
        {
            InitializeComponent();
            TryLoadApplicationIcon();
            _steamManager = new SteamManager();
            _bridge = new WebBridge(this, _steamManager);
            InitWebView();
        }

        private void TryLoadApplicationIcon()
        {
            try
            {
                var assembly = typeof(MainForm).Assembly;
                var resourceName = assembly.GetManifestResourceNames()
                    .FirstOrDefault(n => n.EndsWith("icon.ico", StringComparison.OrdinalIgnoreCase));

                if (!string.IsNullOrEmpty(resourceName))
                {
                    using var stream = assembly.GetManifestResourceStream(resourceName);
                    if (stream != null)
                    {
                        this.Icon = new Icon(stream);
                        return;
                    }
                }

                string iconPath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "Assets", "icon.ico");
                if (File.Exists(iconPath))
                {
                    this.Icon = new Icon(iconPath);
                    return;
                }

                string exePath = Application.ExecutablePath;
                if (File.Exists(exePath))
                {
                    var extracted = Icon.ExtractAssociatedIcon(exePath);
                    if (extracted != null)
                        this.Icon = extracted;
                }
            }
            catch { }
        }

        private void InitializeComponent()
        {
            this.SuspendLayout();
            this.ClientSize = new Size(S(WidthNormal), S(HeightNormal));
            this.FormBorderStyle = FormBorderStyle.None;
            this.StartPosition = FormStartPosition.CenterScreen;
            this.BackColor = ShellBackground;
            this.Text = "SHARPBUY NFA LAUNCHER";
            this.ShowIcon = true;
            
            _webView = new WebView2
            {
                Dock = DockStyle.Fill,
                DefaultBackgroundColor = Color.Transparent
            };

            this.Controls.Add(_webView);
            this.Shown += (_, _) =>
            {
                ApplyWindowRegion(ClientSize.Width, ClientSize.Height, 0);
                Activate();
                BringToFront();
            };
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
                _webView.ZoomFactor = 1.0;
                _webView.CoreWebView2.NavigationCompleted += (_, _) =>
                {
                    ApplyWindowRegion(ClientSize.Width, ClientSize.Height, 0);
                };

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

        private System.Windows.Forms.Timer? _currentAnimTimer;
        private Action? _currentAnimFinalizer;

        private void StopCurrentAnimation(bool finalizeTarget = true)
        {
            if (_currentAnimTimer != null)
            {
                _currentAnimTimer.Stop();
                _currentAnimTimer.Dispose();
                _currentAnimTimer = null;
            }
            if (finalizeTarget && _currentAnimFinalizer != null)
            {
                var fin = _currentAnimFinalizer;
                _currentAnimFinalizer = null;
                fin();
            }
            else
            {
                _currentAnimFinalizer = null;
            }
        }

        private void SetClientSizeInternal(int physWidth, int physHeight, int layoutMode)
        {
            ClientSize = new Size(physWidth, physHeight);
            ApplyWindowRegion(physWidth, physHeight, layoutMode);
        }

        public void SetWindowSize(int logicalWidth, int logicalHeight, int layoutMode = 0)
        {
            if (this.InvokeRequired)
            {
                this.Invoke(() =>
                {
                    StopCurrentAnimation(false);
                    int physW = S(logicalWidth);
                    int physH = S(logicalHeight);
                    SetClientSizeInternal(physW, physH, layoutMode);
                });
            }
            else
            {
                StopCurrentAnimation(false);
                int physW = S(logicalWidth);
                int physH = S(logicalHeight);
                SetClientSizeInternal(physW, physH, layoutMode);
            }
        }

        public Task SetWindowSizeAnimated(int logicalWidth, int logicalHeight, int durationMs = 280, int layoutMode = 0)
        {
            var tcs = new TaskCompletionSource<bool>();
            int targetPhysW = S(logicalWidth);
            int targetPhysH = S(logicalHeight);

            void Run()
            {
                StopCurrentAnimation(true);

                if (ClientSize.Width == targetPhysW && ClientSize.Height == targetPhysH)
                {
                    SetClientSizeInternal(targetPhysW, targetPhysH, layoutMode);
                    tcs.TrySetResult(true);
                    return;
                }

                var start = ClientSize;
                int steps = Math.Max(12, durationMs / 16);
                int step = 0;

                _currentAnimFinalizer = () =>
                {
                    SetClientSizeInternal(targetPhysW, targetPhysH, layoutMode);
                    tcs.TrySetResult(true);
                };

                _currentAnimTimer = new System.Windows.Forms.Timer { Interval = 16 };
                _currentAnimTimer.Tick += (_, _) =>
                {
                    step++;
                    double t = Math.Min(1.0, step / (double)steps);
                    t = 1 - Math.Pow(1 - t, 3);
                    int w = start.Width + (int)((targetPhysW - start.Width) * t);
                    int h = start.Height + (int)((targetPhysH - start.Height) * t);
                    SetClientSizeInternal(w, h, layoutMode);

                    if (step >= steps)
                    {
                        StopCurrentAnimation(true);
                    }
                };

                _currentAnimTimer.Start();
            }

            if (InvokeRequired)
                BeginInvoke(Run);
            else
                Run();

            return tcs.Task;
        }

        public void StartDrag()
        {
            StopCurrentAnimation(true);
            ReleaseCapture();
            SendMessage(this.Handle, WM_NCLBUTTONDOWN, HT_CAPTION, 0);
        }

        public Task MinimizeAnimated(int durationMs = 320)
        {
            var tcs = new TaskCompletionSource<bool>();

            void Run()
            {
                try
                {
                    if (WindowState != FormWindowState.Minimized && IsHandleCreated)
                        AnimateWindow(Handle, durationMs, AW_HIDE | AW_BLEND | AW_VER_NEGATIVE);
                }
                catch { }

                WindowState = FormWindowState.Minimized;
                tcs.TrySetResult(true);
            }

            if (InvokeRequired)
                BeginInvoke(Run);
            else
                Run();

            return tcs.Task;
        }

        public void Minimize()
        {
            if (InvokeRequired)
                Invoke(() => WindowState = FormWindowState.Minimized);
            else
                WindowState = FormWindowState.Minimized;
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
