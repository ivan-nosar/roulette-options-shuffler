# Contributing to Roulette Options Shuffler

Welcome, and thank you for your interest in contributing to Roulette Options Shuffler!

## Code contribution

This site is designed to be 100% serverless. This means that every code placed in this repo will be executed in the user's browser.

The common site logic (such as query string parsing) is implemented at [static/js/index.js](./static/js/index.js) source file, while the UI basement is in [index.html](./index.html) file. Roulette logic is implemented in [static/js/roulette.js](./static/js/roulette.js). Analytics data manipulation perfroms using the [`IndexedDB` technology](https://www.w3.org/TR/IndexedDB/). All database-related logic implemented in [static/js/database.js](./static/js/database.js) source file while the data-visualizing logic is in [static/js/visualize-analytics.js](./static/js/database.js).

## Dependencies used

This project is using a number of dependencies. This repository contains the minified source files of these deps in order to allow this site to work in offline mode. You can find the list of the deps-projects used in this site along with the mapping to the files stored in the repo in the list below:

- [Bootstrap](https://getbootstrap.com/): The UI library used in the site design (buttons and inputs)
  - [static/css/bootstrap.min.css](./static/css/bootstrap.min.css)
  - [static/js/bootstrap](./static/js/bootstrap/)
- [Roboto font](https://fonts.google.com/specimen/Roboto?preview.text_type=custom): The font used in the slot-machine animation
  - [static/fonts](./static/fonts/)
- [Slotmachine (by momokang)](https://momokang.github.io/slotmachine/): The simple library implements the slot-machine animation. The source files came from this library was modified in this repo
  - [static/css/slotmachine.css](./static/css/slotmachine.css)
  - [static/js/slotmachine](./static/js/slotmachine/)
- [Chart.js](https://www.chartjs.org/docs/latest/): Provides a simple HTML5 API to draw the charts inside the <canvas> tag
  - [static/js/Chart.js](./static/js/Chart.js/)

Also the [`ColorHash`](https://github.com/RolandR/ColorHash) library is used with some codestyle polishemnts. Grand merci to Roland Rytz for your great idea and brilliant implementation.

# Thank You!

Your contributions to open source, large or small, make this project possible. Thank you for taking the time to contribute.
