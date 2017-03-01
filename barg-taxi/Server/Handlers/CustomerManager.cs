using Server.Objects;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Server.Handlers
{
    public class CustomerManager
    {
        private static Dictionary<string, Customer> _listCustomers = new Dictionary<string, Customer>();
        public static Dictionary<string, Customer> ListCustomers
        {
            get
            {
                return _listCustomers;
            }
        }
    }
}