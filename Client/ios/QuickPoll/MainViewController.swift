//
//  ViewController.swift
//  QuickPoll
//
//  Created by Oğuz Gelal on 17/11/14.
//  Copyright (c) 2014 Oguz Gelal. All rights reserved.
//

import UIKit

class MainViewController: UIViewController {

    @IBOutlet weak var ipadress: UITextField!
    @IBOutlet weak var portnumber: UITextField!
    @IBOutlet weak var presentationcode: UITextField!
    
    override func viewDidLoad() {
        super.viewDidLoad()
        // Do any additional setup after loading the view, typically from a nib.
    }

    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated.
    }
    
    override func prepareForSegue(segue: UIStoryboardSegue, sender: AnyObject?) {
        let dest = segue.destinationViewController as PollViewController
            dest.ipadress = ipadress.text
            dest.portnumber = portnumber.text
            dest.presentationcode = presentationcode.text


    }

}

