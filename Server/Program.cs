using System;
using SuperWebSocket;

namespace GameOfLife.Server
{
	class Program
	{
		public static void Main()
		{
			var server = new WebSocketServer();
			server.Setup(4521);
			server.Start();

			Console.WriteLine("Running ... press any key to exit");
			Console.ReadKey(true);

			server.Stop();
		}
	}
}
