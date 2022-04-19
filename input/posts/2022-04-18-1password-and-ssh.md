Title: 1Password and SSH
Lead: Securing your dev environment
Published: 2022-04-18
Tags:
  - 1Password
  - SSH
---

I've been using a Password manager for years now, however one thing which always annnoyed me was the lack of SSH support and having your Private key stored in the .ssh folder on your machine. Or you would have to manually generate your SSH key using Putty. Then you would upload your public key and make sure you never lost your private key since it was always stored in the .ssh folder unless you backed it up securely and then would put it back on a fresh install.
  
1Password has a feature which allows it to act as an SSH Agent meaning you no longer need to store your secrets on disk in the .ssh folder but can instead store your SSH data in 1Password.

1Password allows you to store all sorts of sensitive information. You can see in the screenshot below that SSH is an option.

![Create Password](/img/1password-ssh/1.png)

Once you select the SSH Option, you can optionally name the SSH Key and even paste in or upload an existing private ssh key.

![Create or Paste](/img/1password-ssh/2.png)

You will need to make sure any existing SSH Agent Service is not running.
This will allow 1Password to take control over the SSH Named Pipe on Windows.
This should be supported by most Git Versioning tools such as Git for Windows.

![Enable the 1Password SSH Agent](/img/1password-ssh/4.png)

Using Windows Hello Feature, you can see it asks for my PIN. There are other approaches such as using your USB YubiKey to also Authenticate and unlock the 1Password Wallet.
Once I'm validated my SSH session will continue and I will be able to use git push or pull commands using the private SSH Key which is linked to the public SSH key that I uploaded to Github.

![Demo Popup](/img/1password-ssh/3.png)

