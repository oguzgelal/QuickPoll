Instructions
==
***
To start the server, you have to have Node.JS installed on your computer. You can find detailed instructions on how to install from **nodejs.org**

Once you install node, you simply run : 
```
node server.js
```

Commands
==
***
### Server -> Server
<u>**add.[polltitle].[pollcode]**</u> - Add a new poll. (**Don't use dots in title or code**) <br>
<u>**polls**</u> - Display all created polls. <br>
<u>**polls.a**</u> - Display all created polls in detail. <br>
<u>**open.[pollcode].[question]**</u> - Opens the poll for answers with question. <br>
<u>**answer.[pollcode].[answer]**</u> - Add an answer to a question (for debug). <br>
<u>**close.[pollcode]**</u> - Close the poll for answering. <br>
<u>**report.[pollcode]**</u> - Display the latest answers to a poll. <br>


### Server -> Client(s)
<u>**connected**</u> - You (client) have connected to the server. <br>
<u>**cmderr**</u> - Command not found. <br>


### Client -> Server
<u>**connindex**</u> - Server returns the connection index of the client. <br>
<u>**connindex.[pollcode]**</u> - Get the status of the poll. <br>



