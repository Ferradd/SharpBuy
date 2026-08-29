using System;
using System.Drawing;
using System.IO;
using System.Reflection;
using System.Windows.Forms;
using Microsoft.Web.WebView2.Core;
using Microsoft.Web.WebView2.WinForms;

namespace SharpBuy_Checker
{
    public class MainForm : Form
    {
        private WebView2 webView;
        private WebBridge bridge;

        public MainForm()
        {
            InitializeComponent();
            InitializeWebView();
        }

        private void InitializeComponent()
        {
            this.Text = "SharpBuy Batch Steam Token Checker & Manager v1.0";
            this.Size = new Size(1060, 740);
            this.MinimumSize = new Size(840, 620);
            this.StartPosition = FormStartPosition.CenterScreen;
            this.BackColor = Color.FromArgb(11, 13, 20);
            this.Icon = SystemIcons.Shield;

            webView = new WebView2
            {
                Dock = DockStyle.Fill
            };

            this.Controls.Add(webView);
        }

        private async void InitializeWebView()
        {
            try
            {
                string userDataFolder = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "SharpBuy_Checker_Cache");
                var env = await CoreWebView2Environment.CreateAsync(null, userDataFolder);
                await webView.EnsureCoreWebView2Async(env);

                webView.CoreWebView2.Settings.IsStatusBarEnabled = false;
                webView.CoreWebView2.Settings.AreDefaultContextMenusEnabled = false;
                webView.CoreWebView2.Settings.AreDevToolsEnabled = true;

                bridge = new WebBridge();
                webView.CoreWebView2.AddHostObjectToScript("bridge", bridge);

                string htmlContent = GetEmbeddedHtml();
                webView.CoreWebView2.NavigateToString(htmlContent);
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Error initializing WebView2: {ex.Message}", "SharpBuy Checker Error", MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
        }

        private string GetEmbeddedHtml()
        {
            try
            {
                var assembly = Assembly.GetExecutingAssembly();
                string resourceName = "SharpBuy_Checker.Assets.index.html";

                using (Stream stream = assembly.GetManifestResourceStream(resourceName))
                {
                    if (stream != null)
                    {
                        using (StreamReader reader = new StreamReader(stream))
                        {
                            return reader.ReadToEnd();
                        }
                    }
                }

                // Fallback to local file if available
                string assetsPath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "Assets", "index.html");
                if (File.Exists(assetsPath))
                {
                    return File.ReadAllText(assetsPath);
                }
            }
            catch { }

            return "<html><body style='background:#0b0d14;color:#fff;font-family:sans-serif;'><h2>Error loading embedded HTML resource!</h2></body></html>";
        }
    }
}
