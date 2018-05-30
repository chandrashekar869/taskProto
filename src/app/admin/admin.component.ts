import { Component, OnInit } from '@angular/core';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatChipsModule} from '@angular/material/chips';
import { Http, Headers, Response, URLSearchParams } from '@angular/http';
import {NgForm} from '@angular/forms';
import 'rxjs/add/operator/map'
import { element } from 'protractor';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminPageComponent implements OnInit {
  model: any = {};
  addUser:any={};
  editUser:any={};
  resetPass:any={};
  project:any = {};
  projectList:any=["none"];
  selectable: boolean = true;
  removable: boolean = true;
  stage:any = {};
  taskModel:any = {};
  panelOpenState:boolean = true;
  loading = false;
  selectUndefinedOptionValue:any;
  errString:string="None";
  successString:string="None";
  manageDepartment:any={};
  stageList:any=["none"];
  dataBackup={};
  userdataBackup=[];
  taskList:any=["none"];
  emailList:any=[];
  ApproversPresent:any;
  allData:any=[];
  chipSelected:any;
  editDepartmentModel:any={};
  constructor(public title:Title, public http:Http){ }

  ngOnInit(){
    this.title.setTitle("Admin Panel");
      var link="/user?condition=";
      link+=JSON.stringify({})+"&"+"model=Admin";
      this.http.get(link).map(res=>res.json()).subscribe(data=>{
        console.log(data);
        if(data.length>0){
            data=data[0];
            this.dataBackup=data;
            this.departmentsList=data.DepartmentList;
        }
      },err=>{
        console.log(err);
      }); 
      var link="/user?condition=";
      link+=JSON.stringify({})+"&"+"model=None";
      this.http.get(link).map(res=>res.json()).subscribe(data=>{
        console.log(data);
        this.allData=data;
        this.genEmailList([],"none");
      },err=>{
        console.log(err);
      });    
  }
  departmentsList=["none"];
  task = ["task 1 ", "task 2 ", "task 3 ","task 4 ","task 5 ","task 6 "];
  taskSelected: any;

  newFunction(){
  }



  genEmailList(data,department){
    this.emailList=[];
    if(data.length>0){
      data.map(function(element,index){
        if(element.role.name!="Admin" && element.department==department && element.role.canApprove==1)
        this.emailList.push(element.emailId);
      },this);
  }
  }
  reset(form:NgForm,whatToReset){
    var condition;
    var data;
    var param;
    if(whatToReset=='password')
    {
      condition=JSON.stringify({"emailId":this.resetPass.email});
      data=JSON.stringify([this.resetPass.password]);
      param=JSON.stringify(["password"]);
    }
    if(whatToReset=='everything'){
      condition=JSON.stringify({"emailId":this.allData[this.editUser.selectedEmailId]["emailId"]});
      data=JSON.stringify([this.editUser.name,this.editUser.email,this.editUser.mobile,this.editUser.password,this.editUser.selectedDepartment,this.editUser.canApproved==true?1:0,true]);
      param=JSON.stringify(["name","emailId","phone","password","department","role.canApprove","forceLogOut"]);
      console.log(condition,data,param);
      
    }
    this.loading=true;
    this.setAlert("None","None");
    this.http.put("/user",{"condition":condition,"data":data,"param":param})
    .map(res=>res.json())
    .subscribe(data=>{
      this.loading=false;
      console.log(data);
      if(whatToReset=='everything')
      {
        this.allData[this.editUser.selectedEmailId]=data.data;
        this.editUser.selectedEmailId=this.selectUndefinedOptionValue;
        form.reset();
      if(data.message=="SUCCESS")
      this.setAlert("None","User updated successfully.");
      else if(data.code==11000)
      this.setAlert("Email id already exists for another user","None");     
      else
      this.setAlert("None","User details updated successfully.");  
    }
    if(whatToReset=='password')
    {
      form.reset();
    if(data.message=="SUCCESS")
    this.setAlert("None","Password updated successfully.");
  }
    },err=>{
      console.log(err.code);
      this.loading=false;
      if(err=="NOT_EXISTS")
      this.setAlert("Wrong email id","None");     
     });
  }

  editDepartmentFunc(param:any,data:any){
    switch(param){
      case 'chip':
      this.editDepartmentModel.selectedDepartment=data;
      this.editDepartmentModel.departName=data;
      break;
      case 'submit':
      this.loading=true;
    this.setAlert("None","None");
    this.http.put("/editDepartment",{"department":this.editDepartmentModel.selectedDepartment,"newDepartment":this.editDepartmentModel.departName})
    .map(res=>res.json())
    .subscribe(data=>{
      console.log(data)
      this.loading=false;
      if(data.message=="SUCCESS"){
    alert("Department updated successfully.Page will reload to update the data");
   window.location.reload();     
  }  
  if(data.message=="DUPLICATE")
  this.setAlert("The department name already exists","None");
  },err=>{
      this.setAlert("Error.Check data entered and try again!","None");     
     });
      break;
    }
  }

  selectEmail($event){
    console.log($event.target.value);
    if($event.target.value=="undefined")
    {
      this.editUser={};
      this.editUser.selectedDepartment=this.selectUndefinedOptionValue;
      return;
    }
  var temp=this.allData[$event.target.value];
  this.editUser.name=temp.name;
  this.editUser.selectedDepartment=temp.department;
  this.editUser.email=temp.emailId;
  this.editUser.mobile=temp.phone;
  this.editUser.password=temp.password;
  this.editUser.confirmPassword=temp.password;
  this.editUser.canApproved=temp.role.canApprove==1?true:false;
}


  register(form:NgForm){
    this.setAlert("None","None");
      this.loading = true;
      if(this.departmentsList.indexOf(this.addUser.selectedDepartment)==-1)
     {
      this.setAlert("Select a valid department","None");
      this.loading=false;
      return;
     }
      console.log(" model : ",this.addUser);
      if(this.departmentsList.indexOf(this.addUser.selectedDepartment)!=-1){
        this.loading = false;
          this.http.post("/user",{"userData":JSON.stringify(this.addUser)})
          .map(res=>res.json())
          .subscribe(data=>{
            console.log(data);
              console.log(data["message"]["insertedCount"]);
            if(data["message"]["insertedCount"]!=0 && data["message"]["result"]["ok"]==1 ){
              this.setAlert("None","User added successfully");
              this.userdataBackup.unshift(data["data"]);
              this.emailList.unshift(data["data"]["emailId"]);
             console.log(this.allData);
              this.allData.push(data);
                this.addUser={};
                form.resetForm();   
        }
          },err=>{
              if(JSON.parse(err).code==11000){
                this.setAlert("Email already exists","None");
            }
              else{
                this.setAlert("None","None");            
              }
          });
      }

  }
  panelCLick(){
    this.setAlert("None","None");   
    console.log(this.project);
    this.project.department="None";
    this.departmentChange("task");
    this.departmentChange("project");
    this.departmentChange("stage");
    
  }

  setAlert(errString,successString){
    this.errString=errString;
    this.successString=successString;
  }
  
  onOptionsSelected(event){
    console.log(" console :",event);

  }

  remove(param:string,dataToDelete){
    switch(param){
      case 'department':
      var link="/manageDepartment?condition="+JSON.stringify({})+"&departmentName="+dataToDelete;
      this.http.delete(link).map(res=>res.json()).subscribe(data=>{
      console.log(data);
      if(data["DepartmentList"].length>0 && data["DepartmentList"].indexOf(dataToDelete)==-1){
        this.setAlert("None","Department removed successfully");
        this.dataBackup=data;
        this.departmentsList=data.DepartmentList;
        console.log(this.departmentsList,data.DepartmentList);
        this.manageDepartment={};
      }
      else{
        this.dataBackup=data;
        this.departmentsList=data.DepartmentList;
        this.manageDepartment={};
      }
      },err=>{
        console.log(err);
      });
      break;
      case 'project':
      this.setAlert("None","None");
      if(dataToDelete!="none"){
        if(this.departmentsList.indexOf(this.project.selectedDepartment)!=-1){
          this.project.projectName=dataToDelete;
          var link="/projectAdmin?projectData="+JSON.stringify(this.project)};
          this.http.delete(link).map(res=>res.json()).subscribe(data=>{
            this.dataBackup=data.data;
            console.log(this.projectList,data.data.Departments[data.indexOf][this.project.selectedDepartment]["Projects"]);
            this.projectList=data.data.Departments[data.indexOf][this.project.selectedDepartment]["Projects"];
            console.log(data);
          },err=>{
            if(err=="NOT_EXISTS")
            this.setAlert("Doesnt exist anymore","None");
            else
            this.setAlert("None","None");
          });
    }else{
      this.setAlert("Not a valid department","None");
    }
      break;
      case 'stage':
      if(dataToDelete!="none"){
        this.setAlert("None","None");
    if(this.departmentsList.indexOf(this.project.selectedDepartment)!=-1){
      this.stage.stageName=dataToDelete;
      this.stage["selectedDepartment"]=this.project.selectedDepartment;
      var link="/stageAdmin?stageData="+JSON.stringify(this.stage);
      this.http.delete(link).map(res=>res.json()).subscribe(data=>{
        this.dataBackup=data.data;
        this.stageList=data.data.Departments[data.indexOf][this.project.selectedDepartment]["Stages"];
        console.log(data);
      },err=>{
        if(err=="NOT_EXISTS")
        this.setAlert("Stage doesnt exist","None");
        else
        this.setAlert("None","None");
      });
    }
    else{
    
      this.setAlert("Not a valid department","None");
    
    }
      }
      break;
      case 'task':
      if(dataToDelete!="none"){
        this.setAlert("None","None");
    if(this.departmentsList.indexOf(this.project.selectedDepartment)!=-1){
      this.taskModel.taskName=dataToDelete;
      this.taskModel["selectedDepartment"]=this.project.selectedDepartment;
      var link="/taskAdmin?taskData="+JSON.stringify(this.taskModel);
      this.http.delete(link).map(res=>res.json()).subscribe(data=>{
        this.dataBackup=data.data;
        this.taskList=data.data.Departments[data.indexOf][this.project.selectedDepartment]["Tasks"];
        console.log(data);
      },err=>{
        if(err=="NOT_EXISTS")
        this.setAlert("Task doesnt exist","None");
        else
        this.setAlert("None","None");
      });
    }
    else{
    
      this.setAlert("Not a valid department","None");
    
    }
      }
      break;
    }
  }

  departmentChange(val){
    switch(val){
      case 'project':console.log(this.dataBackup);
            console.log(this.project.selectedDepartment);
            if(this.departmentsList.indexOf(this.project.selectedDepartment)!=-1){
            this.dataBackup["Departments"].map((element,index)=>{;
             if(element.hasOwnProperty(this.project.selectedDepartment)){
             if(element[this.project.selectedDepartment]["Projects"].length==0)
               this.projectList=["none"];
              else
                this.projectList=element[this.project.selectedDepartment]["Projects"];     
            }
          });
        }
        break;
      case 'stage':console.log(this.dataBackup);
      console.log(this.project.selectedDepartment);
      if(this.departmentsList.indexOf(this.project.selectedDepartment)!=-1){
      this.dataBackup["Departments"].map((element,index)=>{;
        if(element.hasOwnProperty(this.project.selectedDepartment)){
        if(element[this.project.selectedDepartment]["Stages"].length==0)
          this.stageList=["none"];
        else
          this.stageList=element[this.project.selectedDepartment]["Stages"];     
          }
        });
      }
      break;      
      case 'task':console.log(this.dataBackup);
      console.log(this.project.selectedDepartment);
      this.genEmailList(this.allData,this.project.selectedDepartment);
      if(this.departmentsList.indexOf(this.project.selectedDepartment)!=-1){
      this.dataBackup["Departments"].map((element,index)=>{;
        if(element.hasOwnProperty(this.project.selectedDepartment)){
        if(element[this.project.selectedDepartment]["Tasks"].length==0)
          this.taskList=["none"];
        else
          this.taskList=element[this.project.selectedDepartment]["Tasks"];     
        }
        });
      }
      break;
      case 'taskEdit':console.log(this.dataBackup);
      console.log(this.project.selectedDepartment);
      this.taskModel.Approver=this.selectUndefinedOptionValue;
      if(this.departmentsList.indexOf(this.project.selectedDepartment)!=-1){
      this.dataBackup["Departments"].map((element,index)=>{;
        if(element.hasOwnProperty(this.project.selectedDepartment)){
        if(element[this.project.selectedDepartment]["Tasks"].length==0)
          this.taskList=["none"];
        else
          this.taskList=element[this.project.selectedDepartment]["Tasks"];     
        }
        });
      }
      break;
    }
}
editTask(param,task){
switch(param){
  case 'edit':
  this.errString='None';
  this.chipSelected=task;
  this.taskModel.Approver=this.selectUndefinedOptionValue;
  console.log(this.dataBackup['Departments']);
  this.dataBackup['Departments'].map(function(element,index){
    if(element.hasOwnProperty(this.project.selectedDepartment)){
      if(element[this.project.selectedDepartment]["TaskApprover"].hasOwnProperty(task))
    {
      this.taskModel.Approver=element[this.project.selectedDepartment]["TaskApprover"][task]; 
      if(!Array.isArray(element[this.project.selectedDepartment]["TaskApprover"][task])) 
      this.ApproversPresent=[element[this.project.selectedDepartment]["TaskApprover"][task]];
      else
      this.ApproversPresent=element[this.project.selectedDepartment]["TaskApprover"][task];
    }
    else
    this.errString="No Approver found";
    }
  },this);
  break;
  case 'submit':
  this.setAlert("None","None");
  this.http.put("/taskAdminEdit",{data:JSON.stringify({"department":this.project.selectedDepartment,"task":this.chipSelected,"emailId":this.taskModel.Approver,"toreplace":this.taskModel.ApproversPresent})}).map(res=>res.json()).subscribe(data=>{
    console.log(data);
    this.dataBackup=data;
    this.setAlert("None","Updated Successfully");
  },err=>{
    this.setAlert("Error","None");
    console.log(err);
  });
  break;
  case 'cancel':
  this.project.selectedDepartment=this.selectUndefinedOptionValue;
  this.taskModel.Approver=this.selectUndefinedOptionValue;
  this.taskList=["none"];
  break;
}
}
  DepartmentSubmit(form:NgForm){
    this.setAlert("None","None");
     console.log(" console :",this.manageDepartment);
     
     this.http.put("/manageDepartment",{"condition":JSON.stringify({}),"departmentName":this.manageDepartment["departName"]}).map(res=>res.json()).subscribe(data=>{
       if(data["DepartmentList"].length>0 && data["DepartmentList"].indexOf(this.manageDepartment["departName"])!=-1){
        this.setAlert("None","Department added successfully");
        this.dataBackup=data;
        this.departmentsList=data.DepartmentList;
        this.manageDepartment={};
        form.resetForm();
      }
     },err=>{
      if(err=="DUPLICATE_ENTRY")
      this.setAlert("Department already exists","None");
      else
      this.setAlert("None","None");
     });

    
  }
  ProjectSubmit(form:NgForm){
    this.setAlert("None","None");
    if(this.departmentsList.indexOf(this.project.selectedDepartment)!=-1){
          this.http.put("/projectAdmin",{"projectData":JSON.stringify(this.project)}).map(res=>res.json()).subscribe(data=>{
            this.setAlert("None","Project added successfully");
            this.dataBackup=data.data;
            this.projectList=data.data.Departments[data.indexOf][this.project.selectedDepartment]["Projects"];
            console.log(data);

            //this.project={};
            form.resetForm();    
          },err=>{
            if(err=="DUPLICATE_ENTRY")
            this.setAlert("Project already exists","None");
            else
            this.setAlert("None","None");
          });
    }else{
      this.setAlert("Not a valid department","None");
    }
          console.log(" console :",this.project);
  }
  StageSubmit(form:NgForm){
    this.setAlert("None","None");
    if(this.departmentsList.indexOf(this.project.selectedDepartment)!=-1){
      this.stage["selectedDepartment"]=this.project.selectedDepartment;
      this.http.put("/stageAdmin",{"stageData":JSON.stringify(this.stage)}).map(res=>res.json()).subscribe(data=>{
        this.setAlert("None","Stage added successfully");
        this.dataBackup=data.data;
        this.stageList=data.data.Departments[data.indexOf][this.project.selectedDepartment]["Stages"];
        console.log(data);
        //this.stage={};
        form.resetForm();    
      },err=>{
        if(err=="DUPLICATE_ENTRY")
        this.setAlert("Stage already exists","None");
        else
        this.setAlert("None","None");
      });
    }
    else{
    
      this.setAlert("Not a valid department","None");
    
    }
  }
  TaskSubmit(form:NgForm){
    console.log(this.taskModel.Approver);
   // return;
    this.setAlert("None","None");
    if(this.departmentsList.indexOf(this.project.selectedDepartment)!=-1){
      this.taskModel["selectedDepartment"]=this.project.selectedDepartment;
      this.http.put("/taskAdmin",{"taskData":JSON.stringify(this.taskModel)}).map(res=>res.json()).subscribe(data=>{
        this.setAlert("None","Task added successfully");
        this.dataBackup=data.data;
        this.taskList=data.data.Departments[data.indexOf][this.project.selectedDepartment]["Tasks"];
        console.log(data);
        //this.taskModel={};
        form.resetForm();    
      },err=>{
        if(err=="DUPLICATE_ENTRY")
        this.setAlert("Task already exists","None");
        else
        this.setAlert("None","None");
      });
    }
    else{
    
      this.setAlert("Not a valid department","None");
    
    }
  }

}
