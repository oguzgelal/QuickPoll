//
//  PollViewController.swift
//  QuickPoll
//
//  Created by Oguz Gelal on 23/12/14.
//  Copyright (c) 2014 Oguz Gelal. All rights reserved.
//

import Foundation
import UIKit


class PollViewController: UIViewController {

    var cl : PollSocket!
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        cl = PollSocket()
        cl.addr = "localhost"
        cl.port = 8000
        cl.connect()

        var (success,errmsg) = cl.send(str: "connindex")
        if success {
            var data=cl.read(1024*10)
            if let d = data {
                if let str = NSString(bytes: d, length: d.count, encoding: NSUTF8StringEncoding){
                    println(str)
                }
            }
        }
        
        var data=cl.read(1024*10)
        if let d = data {
            if let str = NSString(bytes: d, length: d.count, encoding: NSUTF8StringEncoding){
                println(str)
            }
        }
        
        
    }
    
    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated.
    }
    
    
    
    
}
