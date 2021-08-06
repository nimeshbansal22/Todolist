const express = require("express");
const bodyparser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
const app = express();


app.set('view engine', 'ejs');

app.use(bodyparser.urlencoded({
  extended: true
}));

app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-Nimesh:nimesh1099@cluster0.zolfk.mongodb.net/todolistDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const itemSchema = new mongoose.Schema({
  name: String
});

const Item = mongoose.model("Item", itemSchema);

const item1 = new Item({
  name: "Welcome To out TODO list!"
});

const item2 = new Item({
  name: "Write in the New Item box and click + button to add to you TODO list"
});

const item3 = new Item({
  name: "<-- Hit This to delete an item"
});

const defaultItems = [item1, item2, item3];

const listSchema = new mongoose.Schema({
  name: String,
  items: [itemSchema]
});

const List = mongoose.model("List", listSchema);

app.get("/", function(req, res) {

  Item.find({}, function(err, listItems) {
    if (listItems.length === 0) {
      Item.insertMany(defaultItems, function(err) {
        if (err) {
          console.log(err);
        } else {
          console.log("Successfully Saved default items to Database");
        }
      });
      res.redirect("/");
    } else {
      res.render("list", {
        kindofday: "Today",
        numberofitems: listItems
      });
    }
  });
});

app.post("/", function(req, res) {
  let newitem = req.body.newItem;
  let detectlist=req.body.listitem;

  const item = new Item({
    name: newitem
  });

  if(detectlist==="Today")
  {
    item.save();
    res.redirect("/");
  }
  else{
    List.findOne({name:detectlist},function(err,result){
      result.items.push(item);
      result.save();
      res.redirect("/"+detectlist);
    });
  }


});

app.post("/delete", function(req, res) {
  const itemid = req.body.ischecked;
  const listname=req.body.listname;

  if(listname==="Today")
  {
    Item.findByIdAndDelete(itemid, function(err, removeid) {
      if (err) {
        console.log(err);
      } else {
        console.log("Delete Successfully: ", removeid);
        res.redirect("/");
      }
    });
  }
  else{
    List.findOneAndUpdate({name:listname},{$pull:{items:{_id:itemid}}},function(err,removeid){
      if(!err)
      res.redirect("/"+listname);
    });
  }


});

app.get('/:customtodolist', function(req, res) {
  const custlistname = _.capitalize(req.params.customtodolist);

  List.findOne({
    name: custlistname
  }, function(err, result) {
    if (!err) {
      if (!result) {
        const list = new List({
          name: custlistname,
          items: defaultItems
        });
        list.save();
        res.redirect("/" + custlistname);
      } else {
        res.render("list", {
          kindofday: result.name,
          numberofitems: result.items
        });
      }
    }
  });
});


app.listen(process.env.PORT, function(res, res) {
  console.log("Server started");
})
