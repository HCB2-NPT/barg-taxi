using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Microsoft.AspNet.SignalR;
using Server.Handlers;
using Server.Objects;
using Newtonsoft.Json;

namespace Server.Hubs
{
    public class MyHub : Hub
    {
        public void Add(string phone, string loc, string note, short cartype)
        {
            Clients.Caller.Add_done(RequestSaver.Add(phone, loc, note, cartype));
        }

        public void Get()
        {
            var f = RequestSaver.Lobby.FirstOrDefault();
            if (f.Key == null)
            {
                Clients.Caller.Get_done(null);
            }
            else
            {
                RequestSaver.Lobby.Remove(f.Key);
                Clients.Caller.Get_done(f.Value);
            }
        }

        public void DriverMove(float lat, float lng)
        {
            if (DriverManager.ListDrivers.ContainsKey(Context.ConnectionId))
            {
                var driver = DriverManager.ListDrivers[Context.ConnectionId];
                //driver.Location = loc;
                driver.Lat = lat;
                driver.Lng = lng;
            }
        }

        public void DriverReady(/*string loc, */float lat, float lng, short cartype)
        {
            if (DriverManager.ListDrivers.ContainsKey(Context.ConnectionId))
            {
                var driver = DriverManager.ListDrivers[Context.ConnectionId];
                //driver.Location = loc;
                driver.Lat = lat;
                driver.Lng = lng;
                driver.Type = cartype;
                driver.State = 1;
            }
        }

        public void DriverCancel(dynamic cus)
        {
            if (DriverManager.ListDrivers.ContainsKey(Context.ConnectionId))
            {
                Customer customer = JsonConvert.DeserializeObject<Customer>(cus.ToString());
                RequestSaver.Add(customer.Phone, customer.Location, customer.Note, customer.Type);
            }
        }

        public void DriverDriving(dynamic cus)
        {
            if (DriverManager.ListDrivers.ContainsKey(Context.ConnectionId))
            {
                var driver = DriverManager.ListDrivers[Context.ConnectionId];
                driver.State = 2;
                //
                Customer customer = JsonConvert.DeserializeObject<Customer>(cus.ToString());
                customer.Driver = driver;
            }
        }

        public void DriverConnect()
        {
            if (!DriverManager.ListDrivers.ContainsKey(Context.ConnectionId))
                DriverManager.ListDrivers.Add(Context.ConnectionId, new Objects.Driver { ConnectionId = Context.ConnectionId, State = 0 });
        }

        public void DriverDisconnect()
        {
            if (DriverManager.ListDrivers.ContainsKey(Context.ConnectionId))
                DriverManager.ListDrivers.Remove(Context.ConnectionId);
        }

        public void CallDrivers(float lat, float lng, float dist, short cartype)
        {
            Clients.Caller.getDrivers(DriverManager.GetDrivers(lat, lng, dist, cartype));
        }

        public void Push2Driver(dynamic cus, Driver dr)
        {
            Clients.Client(dr.ConnectionId).NotifyRequest(cus);
        }
    }
}