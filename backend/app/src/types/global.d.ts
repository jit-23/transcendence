declare module "qrcode";
declare module "speakeasy";
// this file was just made so when compiling error would stop showing up
// what it basically does is say the compiler this exists stop saying it doesn't



//    speakeasy and  qrcode where added to package.json and package-lock.json for the 2-factor authentication
//router.post('/login2FA', login2FA) was added to userRouter for the same reason
//qr code was added to create account and will show up after successfully creating an account
// and login was changed to be able to handle 2-factor authentication
//	twoFactorEnabled twoFactorSecret was added to prisma and verify2FA function was added to userController
//

