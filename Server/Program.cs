using System;
using System.Collections.Generic;
using SuperWebSocket;

namespace GameOfLife.Server
{
	class Program
	{
		public static void Main()
		{
			server = new WebSocketServer();
			server.NewMessageReceived += ServerOnNewMessageReceived;
			server.NewSessionConnected += ServerOnNewSessionConnected;

			server.Setup(4521);
			server.Start();

			Console.WriteLine("Running ... press any key to exit");
			Console.ReadKey(true);

			server.Stop();
		}

		private static void ServerOnNewSessionConnected(WebSocketSession session)
		{
			Console.WriteLine("ID: {0} No. of sessions: {1}", session.SessionID, server.SessionCount);
		}

		private static void ServerOnNewMessageReceived(WebSocketSession session, string value)
		{
			try
			{
				IEnumerable<WebSocketSession> sessions = server.GetAllSessions();
				var en = sessions.GetEnumerator();

				while (en.MoveNext())
				{
					en.Current.Send(value);
				}
			}
			catch (Exception e)
			{
				Console.WriteLine(e.Message);
			}
			
		}

		private static WebSocketServer server;
	}
}
