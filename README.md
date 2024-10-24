# Rule Engine with AST

## Project Overview

**Objective:**  

The "Rule Engine with AST" is a 3-tier application that determines user eligibility based on attributes such as age, department, income, and spending. This application utilizes an Abstract Syntax Tree (AST) to represent conditional rules, enabling dynamic creation, combination, and modification of these rules.

### Features

- **User Authentication:** Login page with session management.
- **Dashboard:** Contains options to create rules, combine rules, and evaluate rules.
- **Error Handling:** Validates rule strings and data formats to ensure proper functionality.
- **Security:** Passwords are stored in an encrypted format in the database.

## Tech Stack

This project is built using the MERN stack:
- **M**ongoDB
- **E**xpress.js
- **R**eact.js
- **N**ode.js

## Data Structure

### Node Structure for AST:
- `type`: String indicating the node type ("operator" for AND/OR, "operand" for conditions)
- `left`: Reference to another Node (left child)
- `right`: Reference to another Node (right child for operators)
- `value`: Optional value for operand nodes (e.g., number for comparisons)

## Database

The application uses MongoDB to store rules and application metadata. The schema should allow for easy manipulation of rules stored in the AST format.

### Database Collections Files

To facilitate easy setup, predefined data exports for the `users` and `rules` collections are included in the `database` folder. You will find two JSON files:
- `users.json`: Contains user records.
- `rules.json`: Contains predefined rules.

### Importing Data with MongoDB Compass

> **Note:** Follow these steps if you are using the Running Locally Without Docker. For the Docker method, data will be handled automatically.

1. **Install MongoDB Compass** if you haven't already. Download it from the [official website](https://www.mongodb.com/try/download/compass).
2. **Open MongoDB Compass**.
3. **Create a new database:**
   - Name it `rule_system`.
4. **Create collections:**
   - Create a collection named `users`.
   - Create a collection named `rules`.

5. **Import Data into the `rule_system` Database:**
   - For the `users` collection:
     - Click on `ADD DATA` and select `Import JSON or CSV File`.
     - Choose the `users.json` file from the `database` folder.
   - For the `rules` collection:
     - Click on `ADD DATA` and select `Import JSON or CSV File`.
     - Choose the `rules.json` file from the `database` folder.

### User Credentials

Once the data is imported, you can log in using the following credentials:
- **Email:** `demo@gmail.com`
  - **Password:** `demo123`
- **Email:** `test@gmail.com`
  - **Password:** `test123`

> **Note:** These credentials apply during the import process and are not related to the Docker process.

### Testing Rules Example in App 

In the "Evaluate" tab, you can evaluate rules using the following format:

```json
{"department": "Sales", "salary": "21000"}
```
> **Note:** In result, the message will print User meets the criteria. which means the rule was evaluated successfully.

## Installations
### Method 1: Running Locally Without Docker

> **Note:** If you are using the Running Locally Without Docker to run the project, you do not need the `docker-compose.yml` file. Feel free to remove it from the directory.


- Database Setup:

  - Ensure you have imported both database files into MongoDB using MongoDB Compass.
  - Make sure your MongoDB server is running locally.

- Clone repository
```
git clone https://github.com/Darshanzapda/rule-engine-with-ast
```
- Before running install necessary dependencies

  - install dependencies by running the following command in the client directory:

  ```
  npm install
  ```
- install dependencies by running the following command in the server directory:

  ```
  npm install express
  npm install cors
  npm install mongoose
  npm install bcryptjs
  npm install jsonwebtoken

   ```
> **Note:** change mongodb location in server.js file

```
mongoose.connect('mongodb://mongodb:27017/rule_system') To mongoose.connect('mongodb://localhost:27017/rule_system') Save file
```
- now run command in server directory
```
node server.js
```

Run the Frontend: Navigate to the client directory and run:

```
npm start
```
Open your browser:
Navigate to http://localhost:3000/login to access the application.

### Method 2: Using Docker

> **Note:** First, clone the repository to your local machine before proceeding with Docker.

### Clone the repository:

```
git clone https://github.com/Darshanzapda/rule-engine-with-ast
```

### Prerequisites

Make sure to have Docker installed on your system.

- Build the Docker images: Ensure you have your Dockerfile and docker-compose.yml properly configured.

- Ensure Docker Desktop is running.

- Make sure the folder name is 'Rule-Engine-AST'.

- In the server.js file, ensure the MongoDB connection is set to:

```
mongoose.connect('mongodb://mongodb:27017/rule_system')
```
- Run the application: From your project directory, execute:

```
docker-compose up --build
```
- To stop the application press ```Ctrl + C``` From your project directory, and execute this to stop appliaction:

```
docker-compose down
```
> **Note:** First, try logging in using the credentials mentioned in the Login section. If you encounter an "Invalid credentials" error, follow the steps below to manually create a new user.


- Open another terminal and run the following command to access the MongoDB shell:

```
docker exec -it mongodb mongosh
```
- Switch to the rule_system database:
```
use rule_system
```

- Insert a new user by running:
```
db.users.insertOne({
  username: "newuser",
  email: "demo@gmail.com",  // Email for login
  password: "$2b$12$0FGAI68KYn2U6kGmjnciG.Wj2WcVswIiq18CQKeQWAU/7I8Rw58RC"  // Hashed password for 'demo123'
})
```
- Ensure Docker is running when you perform these steps.

### Login:

- Now, go to your browser and navigate to http://localhost:3000/login. Enter the email ```demo@gmail.com``` and the password ```demo123.```
> **Note:**  If you encounter an error during login, it may be due to invalid credentials. If there’s no error after entering valid credentials but you’re not redirected to the dashboard, refresh the page and try again.
If there’s no data in the "Combine" and "Create" tables, follow these steps to add the rules.

### Testing and Validation:

- First, go to the "Create Rule" section and enter this rule: ```(department = 'Sales')```

- After the success message, add another rule: ```(salary > 20000 OR experience > 5)```

- Then, go to the "Combine Rule" section, select both rules, and click the "Combine Rule" button. It will show the combined rule in the "Combined Rules" table.

- To evaluate, go to the "Evaluate" tab and enter 
```{"department":"Sales", "salary":"21000"} ```
in the "Evaluate Rules" field. The result will return the message ```User meets the criteria.```

### Check Ports:
-  The backend is running on port 5000.
-  The frontend is running on port 3000.
-  MongoDB runs on port 27017.

### Usage
- Use the login credentials you created to access the application dashboard. You can navigate through features like creating rules, combining rules, and evaluating them.

### Design Choices
-  The application architecture is structured into three layers (UI, API, and Backend), allowing for separation of concerns.
-  The choice of using an AST enables dynamic rule handling, which can be modified and extended as needed.

