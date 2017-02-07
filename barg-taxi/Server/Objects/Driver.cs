using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Server.Objects
{
    public class Driver
    {
        public string ConnectionId { get; set; }
        public string Location { get; set; }
        public float Lat { get; set; }
        public float Lng { get; set; }
        public short Type { get; set; }
        public short State { get; set; }
    }
}