Title: SWTOR and Login Automation
Lead: How to use 1Password CLI and Power Automate to 1 click login
Published: 2022-12-22
Tags:
  - 1Password
  - SWTOR
  - MMORPG
---

Power Automate should be installed already if you are on Windows 11. I created a brand new flow and named it 'SWTOR Launch'. 

You will need to install the 1Password CLI too and ensure it's added to your `PATH` like any other tool.

![1Password CLI setting](https://i.imgur.com/i397HPZ.png)


![Power Automate](https://i.imgur.com/xrPllgz.png)

There are almost endless possibilies to automate tasks from Power automate ranging from remote to local. Lets take a look at how I have automated the login process for SWTOR.

The next screenshot shows all the individual actions I have inserted as part of my new flow. Each step is using a specific feature which you can click and drag onto the flow which you can then further customise each step to read from custom variables etc.

![Flow Steps](https://i.imgur.com/J7Kb9QM.png)

The first step is to ensure the Launcher is actually running, so that we can insert the credentials into the launcher. The next step is to create a custom script step and use the 1Password CLI tool (added to my PATH) and to use the special one password item API to extract the credentials from my Password manager (This step actually activates Windows Hello, where I can tap my Ubikey to authenticate and allow 1Password to continue).

![1Password](https://i.imgur.com/KPaEgUJ.png)

This command is essentually going to extract the following which is stored in my 1Password like so.....

![1Password output](https://i.imgur.com/8XnU7FT.png)

![1Password item](https://i.imgur.com/3RJeY9k.png)

We want 1Password to output this in a format which we can then consume easily in Power Automate, which is `JSON` so we use the `--format json`. This is then inserted into a `%PowershellOutput% variable. Variables can be freely renamed, I just left the default name.

Once we have this, we want to then navigate and extract some of the variables for debugging and ease of use in the following step, which is to convert JSON to a `custom object`.

![Convert to custom object](https://i.imgur.com/DrC76ud.png)

Once the step runs, you'll notice that the variables are visible as they become populated on the right hand side of the flow window.

![Variables](https://i.imgur.com/5jgP9uN.png)

I then fill in the following additional variables based on the fields that will need to entered within the Launcher. Using the `custom object` accessors I populate the variables so that they can be used in the UI automation steps.

![Secrets](https://i.imgur.com/Y8wIngk.png)

Next is to ensure that the UI Elements are configured in Power Automate. You can add UI elements by selecting Windows and configuring how it should scan a UI for fields.

![UI Element 1](https://i.imgur.com/vn8wqww.png)

![UI Element 2](https://i.imgur.com/UcSyi7L.png)

You will need to this process for each individual element that needs to have text entered or clicked on.

![UI Element 3](https://i.imgur.com/sHVogED.png)

Once the UI elements are in, we can then add steps to `reference` these UI elements and populate them.

![UI Element 4](https://i.imgur.com/Bth1UFc.png)

Here's a 30s demo of Power Automate running the flow

![UI Element 5](/img/swtor/automate.gif)