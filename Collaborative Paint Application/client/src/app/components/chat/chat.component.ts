import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit {
  user:string = "LABIB"; //TEMPORAIRE
  message:string; 
  noChat:boolean = false;
  minimized:boolean = false;

  arrayMessage:Array<{user:string,message:string, date: string}> = [];

  constructor() {
   }

  ngOnInit() {
  }
    sendMessage(){
    if(this.message){ //Only send message if something is written in textbox. 
      const date = new Date();
      var minutes = "" +date.getMinutes();
      var seconds = ""+ date.getSeconds();
      if(date.getMinutes() <10){  //Adding a zero in front of time. 
        minutes = "0" + date.getMinutes(); 
      }
      if(date.getSeconds() <10){
        seconds = "0" + date.getSeconds(); 
      }
      const formattedDate = date.getHours() + ":" + minutes + ":" + seconds; //Not pushed in server yet. 
      console.log({user:this.user, message:this.message, date:formattedDate});
      this.arrayMessage.push({user:this.user, message:this.message, date:formattedDate}); // Keeps all the messages sent in an array.
      //this.socketService.messageToPlayer({user:this.user, message:this.message, date:formattedDate});
    }
    this.message = "";
  }

  openChat() {
    this.noChat = false;
  }

   close(){
     this.noChat = true; 
   }

   minimize() {
     this.minimized = !this.minimized;
   }

   popout() {
     
   }

}
