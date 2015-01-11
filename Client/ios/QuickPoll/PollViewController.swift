//
//  PollViewController.swift
//  QuickPoll
//
//  Created by Oguz Gelal on 23/12/14.
//  Copyright (c) 2014 Oguz Gelal. All rights reserved.
//

import Foundation
import UIKit


class PollViewController: UIViewController, UITextFieldDelegate {

    var status_pollOpenMessage = "Poll Open"
    
    var status_pollClosedMessage = "Poll Closed"
    var desc_pollClosedMessage = "No questions at the moment. Enjoy the presentation."
    
    var status_cannotConnectMessage = "Cannot connect to the server"
    var desc_cannotConnectMessage = "Pleaes go back and make sure you have entered the correct information."
    
    var status_pollNotFound = "Poll Not Found"
    var desc_pollNotFound = "Please go back and make sure you have entered the correnct code."
    
    var actionButtonRefreshState = "Refresh"
    var actionButtonSendState = "Send"
    
    var answeredQuestions = [String]()
    
    var ipadress: String!
    var portnumber: String!
    var presentationcode: String!
    
    @IBOutlet weak var refreshSendButton: UIButton!
    
    @IBOutlet weak var pollStatus: UILabel!
    @IBOutlet weak var questionText: UILabel!
    @IBOutlet weak var answerBox: UITextField!
    
    var cl : PollSocket!

    @IBAction func refreshsend() {
        var statusreturn = status();
        var question = questionText.text
        
        if (!answerBox.text.isEmpty){
        if ((find(answeredQuestions, question!)) == nil){
            println(statusreturn)
            if (statusreturn == "open"){
                var sendstr = "answer"
                sendstr += "."+presentationcode
                sendstr += "."+answerBox.text
                var (success,errmsg) = cl.send(str: sendstr)
                if (success) {
                    var data=cl.read(1024*10)
                    if let d = data {
                        if let str = NSString(bytes: d, length: d.count, encoding: NSUTF8StringEncoding){
                            println(str)
                            if (str=="success") {
                                var alert = UIAlertController(title: "Success", message: "You have answered the question", preferredStyle: UIAlertControllerStyle.Alert)
                                alert.addAction(UIAlertAction(title: "Okay", style: UIAlertActionStyle.Default, handler: nil))
                                self.presentViewController(alert, animated: true, completion: nil)
                                answerBox.text = ""
                                refreshSendButton.setTitle(actionButtonRefreshState, forState: UIControlState.Normal)
                                answeredQuestions.append(question!)
                            }
                            else{
                                var alert = UIAlertController(title: "Error", message: "Failed to send answer", preferredStyle: UIAlertControllerStyle.Alert)
                                alert.addAction(UIAlertAction(title: "Done", style: UIAlertActionStyle.Default, handler: nil))
                                self.presentViewController(alert, animated: true, completion: nil)
                            }
                        }
                    }
                }
                else{
                    var alert = UIAlertController(title: "Error", message: "Cannot connect to the server", preferredStyle: UIAlertControllerStyle.Alert)
                    alert.addAction(UIAlertAction(title: "Done", style: UIAlertActionStyle.Default, handler: nil))
                    self.presentViewController(alert, animated: true, completion: nil)
                }
            }
            
        }
        else {
            var alert = UIAlertController(title: "Error", message: "You have answered to this question before", preferredStyle: UIAlertControllerStyle.Alert)
            alert.addAction(UIAlertAction(title: "Done", style: UIAlertActionStyle.Default, handler: nil))
            self.presentViewController(alert, animated: true, completion: nil)
            answerBox.text = ""
            refreshSendButton.setTitle(actionButtonRefreshState, forState: UIControlState.Normal)
        }
        }
    }
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        answerBox.delegate = self
        answerBox.returnKeyType = .Done
        
        cl = PollSocket()
        cl.addr = ipadress
        cl.port = portnumber.toInt()!
        cl.connect()
        
        status();
        
    }
    @IBAction func answerBoxTextEntered(sender: AnyObject) {
        if (!answerBox.text.isEmpty){
            refreshSendButton.setTitle(actionButtonSendState, forState: UIControlState.Normal)
        }
        else {
            refreshSendButton.setTitle(actionButtonRefreshState, forState: UIControlState.Normal)
        }
    }
    
    func status()-> String{
        
        var msg = "status"
        if (!presentationcode.isEmpty){ msg+="."+presentationcode }
        
        var (success,errmsg) = cl.send(str: msg)
        if (success) {
            var data=cl.read(1024*10)
            if let d = data {
                if let str = NSString(bytes: d, length: d.count, encoding: NSUTF8StringEncoding){
                    
                    var strArr = str.componentsSeparatedByString(".")
                    
                    if (strArr[0] as NSString == "pollnotfound"){
                        setLayoutPollNotFound();
                        return "pollnotfound";
                    }
                    else if (strArr[0] as NSString == "close"){
                        setLayoutPollClosed();
                        return "close";
                    }
                    else if (strArr[0] as NSString == "open"){
                        setLayoutPollOpen(strArr[1] as NSString);
                        return "open";
                    }
                    else{ return str; }
                }
            }
        }
        else {
            pollStatus.text = status_cannotConnectMessage
            pollStatus.backgroundColor = UIColor.redColor()
            questionText.text = desc_cannotConnectMessage
        }
        return "nil"
    }
    
    /* Sets layout when poll is closed */
    func setLayoutPollClosed(){
        pollStatus.text = status_pollClosedMessage
        pollStatus.backgroundColor = UIColor.redColor()
        questionText.text = desc_pollClosedMessage
        answerBox.userInteractionEnabled = false
    }
    /* Sets layout when poll not found */
    func setLayoutPollNotFound(){
        pollStatus.text = status_pollNotFound
        pollStatus.backgroundColor = UIColor.orangeColor()
        questionText.text = desc_pollNotFound
        answerBox.userInteractionEnabled = false
    }
    /* Sets layout when poll open */
    func setLayoutPollOpen(question: String){
        pollStatus.text = status_pollOpenMessage
        pollStatus.backgroundColor = UIColor.greenColor()
        questionText.text = question as NSString
        answerBox.userInteractionEnabled = true
    }
    
    func textFieldShouldReturn(textField: UITextField!) -> Bool {
        textField.resignFirstResponder()
        return true
    }
    

    
    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated.
    }
    
    
    
    
}
