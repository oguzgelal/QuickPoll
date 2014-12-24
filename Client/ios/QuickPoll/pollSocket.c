//
//  pollSocket.c
//  QuickPoll
//
//  Created by Oguz Gelal on 23/12/14.
//  Copyright (c) 2014 Oguz Gelal. All rights reserved.
//

#include <errno.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <arpa/inet.h>
#include <sys/types.h>
#include <netinet/in.h>
#include <sys/socket.h>
#include <sys/stat.h>
#include <dirent.h>
#include <netdb.h>
#include <unistd.h>
#include <fcntl.h>
#include <signal.h>

int pollConnect(const char *host,int port){
    
    struct sockaddr_in socketAddr;
    struct hostent *targetHost = gethostbyname(host);

    // Create socket instance
    int pollSocket = socket(targetHost->h_addrtype, SOCK_STREAM, 0);
    
    // Populate socket
    bcopy((char *)targetHost->h_addr, (char *)&socketAddr.sin_addr, targetHost->h_length);
    socketAddr.sin_family = targetHost->h_addrtype;
    socketAddr.sin_port = htons(port);
    
    // Set block
    int flags = fcntl(pollSocket,F_GETFL,0);
    fcntl(pollSocket, F_SETFL, flags | O_NONBLOCK);
    
    // Connect
    connect(pollSocket, (struct sockaddr *)&socketAddr, sizeof(socketAddr));
    
    // Set block
    int flags2 = fcntl(pollSocket,F_GETFL,0);
    flags2 &= ~ O_NONBLOCK;
    fcntl(pollSocket, F_SETFL, flags);
    int set = 1;
    setsockopt(pollSocket, SOL_SOCKET, SO_NOSIGPIPE, (void *)&set, sizeof(int));
    
    return pollSocket;
    
}

int pollClose(int socket){
    return close(socket);
}

int pollSend(int pollSock,const char *data,int len){
    int byteswrite = 0;
    while (len-byteswrite>0) {
        int writelen=(int) write(pollSock, data+byteswrite, len-byteswrite);
        if (writelen<0) { return -1; }
        byteswrite+=writelen;
    }
    return byteswrite;
}

int pollPull(int pollSock,char *data,int len){
    int readlen=(int)read(pollSock,data,len);
    return readlen;
}






