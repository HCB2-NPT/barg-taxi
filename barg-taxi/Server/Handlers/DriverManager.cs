using Server.Objects;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Web;
using System.Xml;
using System.Web.Script.Serialization;

namespace Server.Handlers
{
    public class DriverManager
    {
        private static Dictionary<string, Driver> _listDrivers = new Dictionary<string, Driver>();
        public static Dictionary<string, Driver> ListDrivers
        {
            get
            {
                return _listDrivers;
            }
        }

        public static Driver[] GetDrivers(float lat, float lng, float dist, short cartype)
        {
            var list = new List<Driver>();
            foreach (var pair in _listDrivers)
            {
                if (dist > GetDrivingDistanceInMiles(lat, lng, pair.Value.Lat, pair.Value.Lng)
                    && pair.Value.Type == cartype
                    && pair.Value.State == 1)
                {
                    list.Add(pair.Value);    
                }
            }
            return list.ToArray();
        }

        public static double GetDrivingDistanceInMiles(float originlat, float originlng, float lat, float lng)
        {
            string url = @"http://maps.googleapis.com/maps/api/distancematrix/xml?origins=" +
              originlat + "," + originlng + "&destinations=" + lat + "," + lng +
              "&mode=driving&sensor=false&language=en-EN&units=imperial";

           
            HttpWebRequest request = (HttpWebRequest)WebRequest.Create(url);
            WebResponse response = request.GetResponse();
            Stream dataStream = response.GetResponseStream();
            StreamReader sreader = new StreamReader(dataStream);
            string responsereader = sreader.ReadToEnd();
            response.Close();

            XmlDocument xmldoc = new XmlDocument();
            xmldoc.LoadXml(responsereader);


            if (xmldoc.GetElementsByTagName("status")[0].ChildNodes[0].InnerText == "OK")
            {
                XmlNodeList distance = xmldoc.GetElementsByTagName("distance");
                return Convert.ToDouble(distance[0].ChildNodes[1].Value);
            }

            return double.MaxValue;
        }
    }
}