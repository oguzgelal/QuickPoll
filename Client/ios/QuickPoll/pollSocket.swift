//
//  pollSocket.swift
//  QuickPoll
//
//  Created by Oguz Gelal on 23/12/14.
//  Copyright (c) 2014 Oguz Gelal. All rights reserved.
//

import Foundation

@asmname("pollConnect") func pollConnect_sw(host:UnsafePointer<Int8>,port:Int32) -> Int32
@asmname("pollSend") func pollSend_sw(fwSocket:Int32,s:String,len:Int32) -> Int32
@asmname("pollPull") func pollPull_sw(fd:Int32,buff:UnsafePointer<UInt8>,len:Int32) -> Int32

class PollSocket {
    
    var addr:String
    var port:Int
    var fwSocket:Int32?
    
    init(){
        self.addr=""
        self.port=0
    }
    init(addr a:String,port p:Int){
        self.addr=a
        self.port=p
    }
    
    func connect()->(Bool,String){
        var socket:Int32=pollConnect_sw(self.addr, Int32(self.port))
        self.fwSocket=socket
        return (true, "Connected")
    }
    
    func send(str s:String)->(Bool,String){
        if let fwSocket:Int32 = self.fwSocket {
            var sendsize:Int32 = pollSend_sw(fwSocket, s, Int32(strlen(s)))
            if sendsize == Int32(strlen(s)) { return (true,"message sent") }
            else { return (false,"message not sent") }
        }
        else { return (false,"socket not open") }
    }
    
    func read(len:Int)->[UInt8]?{
        if let fwSocket:Int32 = self.fwSocket {
            var buff:[UInt8] = [UInt8](count:len,repeatedValue:0x0)
            var readLen:Int32=pollPull_sw(fwSocket, &buff, Int32(len))
            if readLen<=0{ return nil }
            var rs=buff[0...Int(readLen-1)]
            var data:[UInt8] = Array(rs)
            return data
        }
        return nil
    }
    
    
}