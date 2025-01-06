namespace SignalRChat.Hub
{
    using Microsoft.AspNetCore.SignalR;

    namespace SignalRChat.Hubs
    {
        //public class ChatHub : Hub
        //{
        //    private static readonly Dictionary<string, string> ConnectedUsers = new();

        //    // Broadcast message to all clients
        //    public async Task SendMessage(string user, string message)
        //    {
        //        await Clients.All.SendAsync("ReceiveMessage", user, message);
        //    }

        //    // Send message to a specific client
        //    public async Task SendMessageToClient(string connectionId, string message)
        //    {
        //        await Clients.Client(connectionId).SendAsync("ReceiveMessage", "Server", message);
        //    }

        //    // Join a group
        //    public async Task JoinGroup(string groupName)
        //    {
        //        await Groups.AddToGroupAsync(Context.ConnectionId, groupName);
        //        await Clients.Group(groupName).SendAsync("ReceiveMessage", "Server", $"{Context.ConnectionId} joined {groupName}");
        //    }

        //    // Leave a group
        //    public async Task LeaveGroup(string groupName)
        //    {
        //        await Groups.RemoveFromGroupAsync(Context.ConnectionId, groupName);
        //        await Clients.Group(groupName).SendAsync("ReceiveMessage", "Server", $"{Context.ConnectionId} left {groupName}");
        //    }

        //    // Track connected users
        //    public override async Task OnConnectedAsync()
        //    {
        //        string connectionId = Context.ConnectionId;
        //        string userName = Context.User?.Identity?.Name ?? "Anonymous";
        //        ConnectedUsers[connectionId] = userName;

        //        await Clients.All.SendAsync("UserConnected", connectionId, userName);
        //        await base.OnConnectedAsync();
        //    }

        //    public override async Task OnDisconnectedAsync(Exception exception)
        //    {
        //        string connectionId = Context.ConnectionId;
        //        if (ConnectedUsers.ContainsKey(connectionId))
        //        {
        //            ConnectedUsers.Remove(connectionId);
        //            await Clients.All.SendAsync("UserDisconnected", connectionId);
        //        }
        //        await base.OnDisconnectedAsync(exception);
        //    }

        //    public async Task Typing(string user)
        //    {
        //        await Clients.Others.SendAsync("UserTyping", user);
        //    }
        //}


        public class ChatHub : Hub
        {
            private static readonly Dictionary<string, string> ConnectedUsers = new();

            public override async Task OnConnectedAsync()
            {
                ConnectedUsers[Context.ConnectionId] = "online";
                await Clients.All.SendAsync("UserStatusUpdate", ConnectedUsers);
                await base.OnConnectedAsync();
            }

            public override async Task OnDisconnectedAsync(Exception? exception)
            {
                ConnectedUsers.Remove(Context.ConnectionId);
                await Clients.All.SendAsync("UserStatusUpdate", ConnectedUsers);
                await base.OnDisconnectedAsync(exception);
            }

            public async Task SendMessageToAll(string user, string message)
            {
                await Clients.All.SendAsync("ReceiveMessage", user, message);
            }

            public async Task SendMessageToClient(string connectionId, string user, string message)
            {
                await Clients.Client(connectionId).SendAsync("ReceiveMessage", user, message);
            }

            public async Task JoinGroup(string groupName)
            {
                await Groups.AddToGroupAsync(Context.ConnectionId, groupName);
                await Clients.Group(groupName).SendAsync("ReceiveMessage", "System", $"{Context.ConnectionId} has joined the group {groupName}");
            }

            public async Task LeaveGroup(string groupName)
            {
                await Groups.RemoveFromGroupAsync(Context.ConnectionId, groupName);
                await Clients.Group(groupName).SendAsync("ReceiveMessage", "System", $"{Context.ConnectionId} has left the group {groupName}");
            }

            public async Task TypingNotification(string connectionId)
            {
                await Clients.Client(connectionId).SendAsync("ReceiveTypingNotification", Context.ConnectionId);
            }
        }
    }

}
