const express = require("express");
const mongoose = require("mongoose");
const Contact = require("./model/contactModel");
const app = express();
const PORT = 8000;

//mongoDb connection
mongoose
  .connect(
    "mongodb+srv://pavannavde:12345@cluster0.ohji7jw.mongodb.net/ContactListDb"
  )
  .then(() => console.log("MongoDb is connected"))
  .catch((err) => console.log(err));

//middleWare
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello world");
});

//create a route for for new contact
app.post("/create-contact", async(req, res) => {
  const { name, phone } = req.body;
  console.log(name,phone);
  const phoneNumbers = phone.split(",");
  try {
    //validate name and phone
    if (!name || !phoneNumbers.length >0) {
      res.status(422).json({ error: "plz fill the data" });
      return 0;
    }
    //check the numbers are 10 digit
    if (phoneNumbers.length > 0) {
        phoneNumbers.forEach(element => {
            if(element.length != 10){
                res.json({ 
                    status: 422,
                    error: "phone number is not valid" });
                return 0;
            }
        });
    }

    //check phonenumbers  is already exist
    const isExits = await Contact.findOne({ phone: phoneNumbers});
    if (isExits) {
      res.json({
         status: 422,
         error: "phone number already exist" });
      return 0;
    }

    //save the contact
    const contactObj = new Contact({
      name,
      phone
    });
    
    const contact = await contactObj.save();
    res.json({
        status: 201,
        message: "contact saved successfully",
        contact: contact
    });
    
  } catch (err) {
    res.json({
        status: 500,
        message: "Internal server error",
        error: err});
  }
});

//get all the contacts
app.get("/get-Contacts", async(req, res) => {
    try{
        const contacts = await Contact.find();
        console.log(contacts);
        res.json({
            status: 200,
            message: "Successfuly fetched all contacts",
            contacts: contacts
        });
    }
    catch(err){
        res.json({
            status: 500,
            message: "Internal server error",
            error: err});
    }
    
});

//search contact by name and phone
app.post("/search-contacts", async(req, res) => {
    const { name, phone } = req.body;
    try{
        const contacts = await Contact.find({$or: [{name: name}, {phone: phone}]});
        console.log(contacts);
        if(contacts.length==0){
            res.json({
                status: 422,
                message: "No contact found"
            });
            return 0;
        }
        res.json({
            status: 200,
            message: "Successfuly fetched all contacts",
            contacts: contacts
        });
    }
    catch(err){
        res.json({
            status: 500,
            message: "Internal server error",
            error: err});
    }

});

//delete contact by id
app.get("/delete-contact/:id", async(req, res) => {
    const { id } = req.params;
    try{
        const contact = await Contact.findByIdAndDelete(id);
        res.json({
            status: 200,
            message: "Successfuly deleted the contact",
            contact: contact
        });
    }
    catch(err){
        res.json({
            status: 500,
            message: "Internal server error",
            error: err});
    }

});

//Update contact by id
app.post("/update-contact/:id", async(req, res) => {
    const { id } = req.params;
    const { name, phone } = req.body;
    let phoneNumbers = [];
    if(phone){
        phoneNumbers = phone.split(',');
    }
    try{
      //check the numbers are 10 digit
      if (phoneNumbers.length > 0) {
          phoneNumbers.forEach(element => {
              if(element.length != 10){
                  res.json({ 
                      status: 422,
                      error: "phone number is not valid" });
                  return 0;
              }
          });
      }
      //check phonenumbers  is already exist
      const isExits = await Contact.findOne({ phone: phoneNumbers});
      if (isExits) {
        res.json({
           status: 422,
           error: "phone number already exist" });
        return 0;
      }
        const contact = await Contact.findByIdAndUpdate(id, {name: name, phone: phone});
        res.json({
            status: 200,
            message: "Successfuly updated the contact",
            contact: contact
        });
    }
    catch(err){
        res.json({
            status: 500,
            message: "Internal server error",
            error: err});
    }

});


app.listen(PORT, () => {
  console.log(`server is runnig on Port :${PORT}`);
});
