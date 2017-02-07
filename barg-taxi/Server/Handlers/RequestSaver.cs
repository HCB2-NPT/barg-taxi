using Server.Objects;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Server.Handlers
{
    public class RequestSaver
    {
        private static Dictionary<string, Customer> _lobby = new Dictionary<string, Customer>();
        public static Dictionary<string, Customer> Lobby
        {
            get
            {
                return _lobby;
            }
        }

        public static bool Add(string phone, string loc, string note, short cartype)
        {
            if (!_lobby.ContainsKey(phone))
            {
                _lobby.Add(phone, new Customer 
                { 
                    Phone = phone, 
                    Location = loc, 
                    Note = note,
                    Type = cartype
                });
                return true;
            }
            return false;
        }

        public static bool Remove(string phone)
        {
            if (_lobby.ContainsKey(phone))
            {
                _lobby.Remove(phone);
                return true;
            }
            return false;
        }

        public static Customer Get(string phone)
        {
            if (_lobby.ContainsKey(phone))
                return _lobby[phone];
            return null;
        }
    }
}