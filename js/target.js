"use strict";

// global storage for all targets
let targets = [];

$(document).ready(() => {
  // display current number of targets
  $("#num_targets").text(targets.length);
  // display summary
  updateSummary();
  $("#btn_toggle_form").click(toggleForm);
  $("#btn_add").click(addTarget);
  $("#btn_cancel").click(resetErrMsgs);
  // open modal to show target details
  $(document).on("click", ".showInfo", function () {
    let objId = parseInt($(this).val());
    displayTargetInfo(objId);
  });
  // close modal
  $(document).on("click", "#close_btn", () => {
    closeModal();
  });
  // call delete fxn
  $(document).on("click", ".delBtn", function () {
    let objId = parseInt($(this).val());
    deleteTarget(objId);
  });
  // open update modal
  $(document).on("click", ".update_btn", function () {
    let objId = parseInt($(this).val());
    openUpdateModal(objId);
  });

  // update hours prayed
  $(document).on("click", "#add_hrs_btn", function () {
    let objId = parseInt($(this).val());
    updateHoursPrayed(objId);
  });
});

const updateSummary = () => {
  // loop through each target
  let num_completed = 0;
  let num_in_progress = 0;
  $("#num_targets").text(targets.length);
  // if hrs_left is 0, increment completed
  if (targets.length > 0) {
    $("#t_heading").text("Here are your targets...");
    targets.forEach((t) => {
      if (t.hrs_left == 0) {
        num_completed++;
      } else {
        // increment in-progress
        num_in_progress++;
      }
    });
  } else {
    $("#t_heading").text("Start adding targets to see them below");
  }
  // display completed and in progress figures
  $("#completed_targets").text(num_completed);
  $("#progress_targets").text(num_in_progress);
};

/**
 * close modal
 */
const closeModal = () => {
  // set display of modal to none and remove it from the DOM
  $(".target_modal").css({ display: "none" });
  $("div").remove(".target_modal");
};

/**
 * toggle visibility of form
 * @param {*} evt clicked button
 */
const toggleForm = (evt) => {
  // prevent default action
  evt.preventDefault();
  const btn = $(evt.currentTarget);
  // the next sibling of btn is the add target for
  btn.next().slideToggle(800);
  btn.next().toggleClass("hide");
  // change text in button if form is showing
  if (btn.next().attr("class") == "new hide") {
    btn.text("New Target");
  } else {
    btn.text("Hide");
    // focus on first input field
    $("#topic").focus();
  }
};

/**
 * reset error messages in form
 */
const resetErrMsgs = () => {
  $("#topic").next().text("*");
  $("#desc").next().text("*");
  $("#t_hours").next().text("*");
  $("#scripture").next().text("*");
};

/**
 * clear input fields in form
 */
const clearForm = () => {
  $("#topic").val("");
  $("#desc").val("");
  $("#t_hours").val("");
  $("#scripture").val("");
  $("#topic").focus();
};

const addTarget = () => {
  // clear all error messages
  resetErrMsgs();
  let hasErrors = false;
  // get all input fields
  const topic = $("#topic").val();
  const description = $("#desc").val();
  const t_hours = $("#t_hours").val();
  const scripture = $("#scripture").val();
  // get error msgs
  const topicErr = $("#topic").next();
  const descErr = $("#desc").next();
  const t_hoursErr = $("#t_hours").next();
  const scriptureErr = $("#scripture").next();

  // validation for topic, description, target hours,
  // and scripture
  if (topic == "") {
    topicErr.text("required");
    hasErrors = true;
  }
  if (description == "") {
    descErr.text("required");
    hasErrors = true;
  }
  if (t_hours == "") {
    t_hoursErr.text("required");
    hasErrors = true;
    // target must not be 0 or negative
  } else if (t_hours < 1) {
    t_hoursErr.text("target must be a positive number");
    hasErrors = true;
  }
  if (scripture == "") {
    scriptureErr.text("required");
    hasErrors = true;
  }

  if (!hasErrors) {
    // get current date
    let today = new Date();
    // get a nice display of today's date
    let todayObj =
      today.getDate() + "-" + today.getMonth() + "-" + today.getFullYear();
    // initialize hours prayed
    let hrs_prayed = 0;

    // create target object
    // hrs_left helps determine if target is completed or not
    let new_target = {
      id: targets.length,
      topic: topic.toUpperCase(),
      description: description,
      target_hours: t_hours,
      hrs_prayed: hrs_prayed,
      hrs_left: t_hours,
      scripture: scripture,
      date_created: todayObj,
    };

    // add new target obj to array
    targets.push(new_target);
    // create view for new target
    createTarget(new_target);

    updateSummary();
    clearForm();
    resetErrMsgs();
  }
};

/**
 * create display element of new target
 */
const createTarget = (t) => {
  // get container div for target element
  const target_container = document.querySelector(".targets");
  // create div for target
  const node = document.createElement("div");
  // assign class for div
  node.setAttribute("class", "target_card");
  // set id of div to target's id
  node.setAttribute("id", `t_${t.id}`);
  // create div's content
  node.innerHTML = `
  <div class="target_content">
    <div class="target_progress"><span>${t.hrs_prayed}/${t.target_hours}</span></div>
    <div class="target_info">
      <h3>${t.topic}</h3>
      <p>${t.description}</p>
      <p>Created: ${t.date_created}</p>
    </div>
  </div>
  <div class="btn-row">
  <button class="showInfo" value="${t.id}">
  <img src="../images/info.png" alt="information" />
  </button>
    <button class="update_btn" value="${t.id}"><img src="../images/edit.png" alt="pen" /></button>
    <button class="delBtn" value="${t.id}"><img src="../images/bin.png" alt="trash can" /></button>
  </div>
`;
  // insert created div into parent div
  target_container.append(node);
};

/**
 * delete target
 * @param {*} t_id id of target
 */
const deleteTarget = (t_id) => {
  // find index of target's id
  const index = targets.map((e) => e.id).indexOf(t_id);
  //  remove target from array
  targets.splice(index, 1);
  renderTargets();
  updateSummary();
};

/**
 * increment number of hours prayed for a target
 * @param {*} t_id id of target
 */
const updateHoursPrayed = (t_id) => {
  // find index of target's id
  const index = targets.map((e) => e.id).indexOf(t_id);
  const t = targets[index];
  // get numerical value of target hours
  const target_hrs = parseInt(t.target_hours);
  const hrs_prayed = $("#new_h").val().trim();
  const hrsError = $("#h_error");
  // validation: hrs_prayed must be positive and less than
  // target hours
  if (hrs_prayed > target_hrs) {
    $("#h_error").text("Hours prayed cannot be more than target");
  } else if (hrs_prayed < 1) {
    $("#h_error").text("Hours prayed must be a positive number");
  } else {
    t.hrs_prayed = hrs_prayed;
    t.hrs_left = target_hrs - t.hrs_prayed;
    $("#h_error").text("");
    closeModal();
    renderTargets();
    updateSummary();
  }
};

/**
 * display all targets in array
 */
const renderTargets = () => {
  $("div").remove(`.target_card`);
  targets.forEach((t) => {
    createTarget(t);
  });
};

/**
 * create modal to display target info
 */
const displayTargetInfo = (t_id) => {
  // find index of target's id
  const index = targets.map((e) => e.id).indexOf(t_id);
  const t = targets[index];
  // get container for where modal will be place
  const section_container = document.querySelector(".all_targets");

  // create modal element and insert target's values
  const newModal = document.createElement("div");
  newModal.setAttribute("class", "target_modal");
  newModal.innerHTML = `
   <div class="target_modal-content">
   <button id="close_btn">&times;</button>
   
             <div class="t_head"><h3>${t.topic}</h3></div>
             <div class="wrap-circles">
   <div class="circle per-25">
     <div class="inner">
       ${t.hrs_prayed} / ${t.target_hours}
     </div>
     <span class="c-txt">hours</span>
   </div>
 </div>
 <p>${t.description}</p>
             
             <p>${t.scripture}</p>
             <p>Date Created: ${t.date_created}</p>
           </div>
   `;
  section_container.append(newModal);
  newModal.style.display = "block";
};

/**
 * create modal to edit hours prayed
 */
const openUpdateModal = (t_id) => {
  // find index of target's id
  const index = targets.map((e) => e.id).indexOf(t_id);
  const t = targets[index];
  const section_container = document.querySelector(".all_targets");
  const newModal = document.createElement("div");
  newModal.setAttribute("class", "target_modal");
  newModal.innerHTML = `
   <div class="target_modal-content">
    <button id="close_btn">&times;</button>
    <div class="h_content">
      <h3>HOW MANY HOURS HAVE YOU PRAYED?</h3>
        <div id="hours">
          <input type="number" name="new_h" id="new_h" value="${t.hrs_prayed}" min="1" />/
          <span>${t.target_hours}</span>
        </div>
        <span id="h_error"></span>
        <div>
        <button id="add_hrs_btn" value="${t_id}">UPDATE</button>
        </div>
    </div>
    </div>
   `;
  section_container.append(newModal);
  newModal.style.display = "block";
};
