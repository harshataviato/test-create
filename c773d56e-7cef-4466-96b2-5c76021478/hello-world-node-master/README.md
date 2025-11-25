# Hello World with Node.js :rocket:

This is a simple **"Hello World"** web application implemented using **Node.js** with the **Express.js** framework and **EJS** for templating, structured according to the Model-View-Controller (MVC) pattern.

## Project Structure

The project is organized into the following directories to maintain a clear separation of concerns:

*   `controllers/`: Contains the logic for handling requests and preparing data for views.
*   `models/`: Encapsulates the application's data and business logic.
*   `views/`: Houses the EJS templates responsible for rendering the UI.
*   `app.js`: The main entry point for the application, setting up the server and routes.
*   `package.json`: Defines project metadata and lists dependencies.

## Setup and Installation

### Prerequisites

Ensure you have Node.js and npm (Node Package Manager) installed on your system.

*   **Node.js**: You can download it from [nodejs.org](https://nodejs.org/). npm is included with Node.js.

To verify your installations, open your terminal or command prompt and run:


### Dependency Installation

Navigate to the project root directory (`hello-world-node-master/`) in your terminal and install the required npm packages:


This command will read the `package.json` file and install `express` and `ejs` into the `node_modules/` directory.

## Running the Server

After installing the dependencies, you can start the Node.js web server.


Alternatively, you can run the main application file directly:


### Accessing the Application

Once the server is running, you will see a message in your console indicating the port. By default, this application runs on `http://localhost:3000`.

Open your web browser and navigate to:


You should see "Hello world!" displayed on the page.
