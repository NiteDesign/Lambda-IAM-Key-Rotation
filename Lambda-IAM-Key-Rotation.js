const AWS = require('aws-sdk');

var iam = new AWS.IAM();
var ses = new AWS.SES({region: 'us-east-1'});

var expirationPeriodDays = process.env.expirationPeriodDays;
var emailSender = process.env.emailSender;
var emailSenderARN = process.env.emailSenderARN;
var emailDomain = process.env.emailDomain;
var IAMGroup = process.env.IAMGroup;


function listUsers(){
  var params = {
    GroupName: IAMGroup
  };
  iam.getGroup(params, function(err, data) {
    if (err) console.log(err, err.stack); // an error occurred
    else  {
      for(var x = 0; x < data.Users.length; x++){
        getAccessKeys(data.Users[x].UserName);
      };
    }
  });
}


function getAccessKeys(userName){
 var now = new Date();
  var params = {
    UserName: userName
  };
  iam.listAccessKeys(params, function(err, data) {
    if (err) console.log(err, err.stack); // an error occurred
    else {
          for(var x = 0; x < data.AccessKeyMetadata.length; x++){
            daysRemaining = parseInt(expirationPeriodDays - ((now - data.AccessKeyMetadata[x].CreateDate) / 86400000) )
            if(daysRemaining > 0 && daysRemaining < 8 && data.AccessKeyMetadata[x].Status == "Active"){
              sendNotification(userName, daysRemaining, data.AccessKeyMetadata[x].AccessKeyId);
            }else if (daysRemaining <= 0 && data.AccessKeyMetadata[x].Status == "Active") {
              console.log("DeActivate the key: " + data.AccessKeyMetadata[x].AccessKeyId)
              deActivateKey(userName, data.AccessKeyMetadata[x].AccessKeyId);
              sendNotificationExpiredKey(userName, data.AccessKeyMetadata[x].AccessKeyId);
            }
          }
    }
  });
}

function deActivateKey(userName, accessKeyId){
  var params = {
   AccessKeyId: accessKeyId,
   Status: "Inactive",
   UserName: userName
  };
  iam.updateAccessKey(params, function(err, data) {
    if (err) console.log(err, err.stack); // an error occurred
    else     console.log(data);           // successful response
  });
}

function sendNotification(userName, daysRemaining, awsKey){
  var params = {
   Destination: {
    ToAddresses: [
       userName + emailDomain
    ]
   },
   Message: {
    Body: {
     Html: {
      Charset: "UTF-8",
      Data: "Hello " + userName + ",<br>This message is to inform you that the following AWS access key is due to expire in " + daysRemaining + " days.<br>AWS key: " + awsKey + "<br><br>Some helpful links:<br><a class=\"ulink\" href=\"https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_access-keys.html#Using_CreateAccessKey\" target=\"_blank\">Managing Access Keys (console)</a><br><a class=\"ulink\" href=\"https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_access-keys.html#Using_CreateAccessKey_CLIAPI\" target=\"_blank\">Managing Access Keys (CLI)</a><br><br>If you need further assistance, please contact the Infrastructure Team."
     },
     Text: {
      Charset: "UTF-8",
      Data: "This is the message body in text format."
     }
    },
    Subject: {
     Charset: "UTF-8",
     Data: "Your AWS Access Key will expire in " + daysRemaining + " days!"
    }
   },
   Source: emailSender,
   SourceArn: emailSenderARN
  };
  ses.sendEmail(params, function(err, data) {
    if (err) console.log(err, err.stack); // an error occurred
    else     console.log(data);           // successful response
  });
}

function sendNotificationExpiredKey(userName, awsKey){
  var params = {
   Destination: {
    ToAddresses: [
       userName + emailDomain
    ]
   },
   Message: {
    Body: {
     Html: {
      Charset: "UTF-8",
      Data: "Hello " + userName + ",<br>This message is to inform you that the following AWS access key has expired and has been set to InActive.<br>AWS key: " + awsKey + "<br><br>Some helpful links:<br><a class=\"ulink\" href=\"https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_access-keys.html#Using_CreateAccessKey\" target=\"_blank\">Managing Access Keys (console)</a><br><a class=\"ulink\" href=\"https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_access-keys.html#Using_CreateAccessKey_CLIAPI\" target=\"_blank\">Managing Access Keys (CLI)</a><br><br>If you need further assistance, please contact the Infrastructure Team."
     },
     Text: {
      Charset: "UTF-8",
      Data: "This is the message body in text format."
     }
    },
    Subject: {
     Charset: "UTF-8",
     Data: "Your AWS Access Key has expired!"
    }
   },
   Source: emailSender,
   SourceArn: emailSenderARN
  };
  ses.sendEmail(params, function(err, data) {
    if (err) console.log(err, err.stack); // an error occurred
    else     console.log(data);           // successful response
  });
}

exports.handler = (event, context, callback) => {
  listUsers();
};
