# coliselia
Common components &amp; services between ophelia and colisee; note: repo name subject to change

![ophelia & colisee interactions](https://docs.google.com/drawings/d/101-QUMbFKBXXyhxuEFta0f9ZmxD309IAI1K4JHHEH4c/pub?w=960&h=720)


https://docs.google.com/drawings/d/101-QUMbFKBXXyhxuEFta0f9ZmxD309IAI1K4JHHEH4c/edit?usp=sharing

[Database](db/README.md)

### Vagrant Usage
Because most of this will be running on servers / AWS / Google Cloud, the target environment is Linux. Some devs do not have immediate access to a Linux machine nor do they want to use VirtualBox traditionally.

Vagrant is basically a virtual machine that allows easy command line access and automatically sets up a shared folder in the working directory. This means any running & execution can take place in the virtual machine; while still being able to use your own computer's editors.

1. Install VirtualBox
2. Install Vagrant
3. Navigate to the project root (where the Vagrantfile is)
4. Run `vagrant up` to setup the virtual image
5. Run `vagrant ssh` to ssh into the newly created virtual image