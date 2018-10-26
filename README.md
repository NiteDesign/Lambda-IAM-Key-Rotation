# Lambda-IAM-Key-Rotation
Lambda to run that will force AWS users to rotate their IAM access keys.

Refer to this post for more details:  http://www.nitedesign.com/improve-your-sec…on-for-iam-users/

#### Lambda variables required to define

**expirationPeriodDays**: The number of days of which a key shouuld be expired.  The notification process will begin notifying 7 days prior.<br>
**emailSender**: The SES email to use to send the email<br>
**emailSenderARN**: The SES ARN to use to send the email<br>
**emailDomain**: Email domain to send emails to, this will be appended to the IAM User name include the '@' symbol: AWSUserName@example.com would require  '@example.com'<br>
**IAMGroup**:  AWS IAM group to query users to rotate their keys<br>
