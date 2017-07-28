# JS Terminal Emulator

An Unix Terminal Emulator implemented using only JavaScript DOM Manipulation.

# Purpose

I was a part of a group project where the goal was to create a Unix tutorial website. To add more interactivity and convenience, 
we wanted to include a terminal so that users could play around with what they just learned. Most existing solutions we found 
were either outdated or manipulated a real file system. The latter was definitely a no no for us since having users 
manipulating the file space of the website would be dangerous. Instead, I decided to create a pseudo-terminal suited 
to our purposes.

If you open the html file in a browser, you will see the original styling of the terminal that was used in the original website. I take NO credit for the design and css of the page. However, I did write all styling for the terminal itself.

**NOTE: This terminal is not meant to be used in a production environment

**NOTE: All link elements are inactive

# How to Use

- Download all files present in this repository (or clone the repository itself)
- Open "terminal.html" in any browser
- Click on the terminal to enter a Unix command

**NOTE: There is a preset file structure available to play with

# Commands & Features Not Supported:

- Any command that leads to the execution of another program such as Vim/Vi, Nano, Pico
- Package Managers
  - man
  - tar
  - etc.
- ipconfig
- ip
- traceroute
- less
- df
- Pathing with a wildcard is not supported
- Certain behaviors of cat are not supported:
  - Zero argument cat is supposed to echo content back to standard out
  - Zero argument cat piping into a separate file
- sl
