using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Server.Objects
{
    public class Customer
    {
        public string Phone { get; set; }
        public string Location { get; set; }
        public string Note { get; set; }
        public short Type { get; set; }
        public Driver Driver { get; set; }
    }
}