using Microsoft.AspNet.SignalR.Client;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Data;
using System.Windows.Documents;
using System.Windows.Input;
using System.Windows.Media;
using System.Windows.Media.Imaging;
using System.Windows.Navigation;
using System.Windows.Shapes;

namespace Listener
{
    /// <summary>
    /// Interaction logic for MainWindow.xaml
    /// </summary>
    public partial class MainWindow : Window
    {
        private IHubProxy _listenerHub;

        public MainWindow()
        {
            InitializeComponent();
        }

        private void send(object sender, RoutedEventArgs e)
        {
            try
            {
                //setup hubs
                if (_listenerHub == null)
                {
                    string url = @"http://localhost:26889/";
                    var connection = new HubConnection(url);
                    _listenerHub = connection.CreateHubProxy("MyHub");
                    connection.Start().Wait();
                    _listenerHub.On("Add_done", x => MessageBox.Show(x ? "Success!" : "Can't request same phone number!"));
                }
                if (!string.IsNullOrEmpty(phone.Text) && !string.IsNullOrEmpty(loc.Text))
                    _listenerHub.Invoke("Add", phone.Text, loc.Text, loc_note.Text, rad_normal.IsChecked == true ? 0 : 1).Wait();
                else
                    MessageBox.Show("Phone or Location is empty.");
            }
            catch
            {
                MessageBox.Show("Disconnected from server. Connecting...");
                while (true)
                {
                    try
                    {
                        string url = @"http://localhost:26889/";
                        var connection = new HubConnection(url);
                        _listenerHub = connection.CreateHubProxy("MyHub");
                        connection.Start().Wait();
                        _listenerHub.On("Add_done", x => MessageBox.Show(x ? "Success!" : "Can't request same phone number!"));
                        break;
                    }
                    catch { }
                }
                MessageBox.Show("Connect to server.");
            }
        }

        private void clear(object sender, RoutedEventArgs e)
        {
            phone.Clear();
            loc.Clear();
        }
    }
}
