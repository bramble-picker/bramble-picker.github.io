
// JS CAT_visualizer.js


// Initialization ------------------------

// Global variables

var canvas, context;
var all_comic_page_images = {};

var story_page_lengths_by_name = {
    "story01" : 5, "story02" : 5, "story03" : 5, "story04" : 5, "story05" : 2,
    "story06" : 6, "story07" : 4, "story08" : 5, "story09" : 2, "story10" : 5,
    "story11" : 5, "story12" : 5, "story13" : 2, "story14" : 5, "story15" : 5,
    "story16" : 6, "story17" : 2, "story18" : 4, "story19" : 5, "story20" : 5,
    "story21" : 5, "story22" : 1, "story23" : 1, "story24" : 5, "story25" : 5,
    "story26" : 5, "story27" : 5, "story28" : 2, "story29" : 5, "story30" : 5,
    "story31" : 5};

function init() {
    canvas = document.getElementById("canvas");
    context = canvas.getContext("2d");
    context.fillStyle = "white";
    context.fillRect(0, 0, canvas.width, canvas.height);
}; // end of function init()


// preload images - first function called
function preload_comic_pages() {
    // for each number of story - story_page_lengths_by_name dict length loop over
    for (var i=0; i < Object.keys(story_page_lengths_by_name).length; i++) {
        var story_name = "story" + (i+1).toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping:false}).toString(); // create a story name string
        var images = []; // create a new array to hold the images for that story
        // for each story in the story_page_lengths_by_name dict, accessed by str
        for (var j=0; j < story_page_lengths_by_name[story_name]; j++) {
            images[j] = new Image();
            images[j].src = "https://www.bramblepicker.com/annotations/" + story_name + "/pages/Page" + (j+1) + ".jpeg";
            images[j].height = 750;
            images[j].width = 575;
        }
        all_comic_page_images[story_name] = images;
    }
    //console.log(all_comic_page_images["story32"]);
    console.log("comics images preloaded");
} // end of function preload_comic_pages()


preload_comic_pages();
document.addEventListener("DOMContentLoaded", init);



// Retrieve Story Images and Annotations, and Page Navigation ---------------------

// NOTE - retrievals:
// The best way to do this is by acessing the server with something like
// Node.js. For now, the images and annotatiosn are brought in using
// methods that would not work for a publically available visualizer tool.

// Global variables:

var annotations;
const story_num_selector = document.getElementById("story_dropdown_by_number");
const story_title_selector = document.getElementById("story_dropdown_by_title");
var current_page_num = 0;
var current_story_num;
var total_num_pages = 0;
const page_counter = document.getElementById("page_counter");


// Functions:

function get_annotations(story_name) {
    const xmlhttp = new XMLHttpRequest();
    xmlhttp.onload = function() {
        annotations = JSON.parse(this.responseText);
    };
    xmlhttp.open("GET", "https://www.bramblepicker.com/annotations/" + story_name + "/" + story_name + ".json");
    xmlhttp.send();
    //console.log(annotations);
}; // end of function get_annotations(story_name)

// NOTE - Function not currently in use!
// this function checks whether an image exists at a particular url
function check_if_image_exists(url, callback) {
    const img = new Image();
    img.src = url;
    
    if (img.complete) {
        callback(true);
    } else {
        img.onload = () => {
            callback(true);
        };
        
        img.onerror = () => {
            callback(false);
        };
    }
}; // end of function check_if_image_exists(url, callback)

function get_comics_images(story_name) {
    comic_page_images = []; // clear the comic_page_images array
    // get the correct length of story in pages from the story_page_lengths dict
    for (var i=0; i<story_page_lengths[story_name]; i++) {
        comic_page_images[i] = new Image();
        comic_page_images[i].src = "https://www.bramblepicker.com/annotations/" + story_name + "/pages/Page" + (i+1) + ".jpeg";
        comic_page_images[i].height = 750;
        comic_page_images[i].width = 575;
    }
}; // end of get_comics_images()

var handle_canvas = {
    
    blank_canvas: function() {
        canvas = document.getElementById("canvas");
        context = canvas.getContext("2d");
        context.clearRect(0, 0, canvas.width, canvas.height); // Clear canvas
        context.fillStyle = "white";
        context.fillRect(0, 0, canvas.width, canvas.height);
    },
    
    put_comic_page_on_canvas: function(current_story, current_page) {
        this.blank_canvas();
        context.drawImage(all_comic_page_images[current_story][current_page], canvas.width/2 - all_comic_page_images[current_story][current_page].width/2, canvas.height/2 - all_comic_page_images[current_story][current_page].height/2,  all_comic_page_images[current_story][current_page].width, all_comic_page_images[current_story][current_page].height);
    }
}; // end of var handle_canvas


// Temporary bounding box maker! --------------------------------------
// Get correct X and Y Coords

function getCursorPosition(canvas, event) {
    const rect = canvas.getBoundingClientRect();
    var x = (event.clientX - rect.left);
    var y = (event.clientY - rect.top);
    console.log("x: " + x + " y: " + y);
};

const c = document.querySelector('canvas')
c.addEventListener('mousedown', function(e) {
                        getCursorPosition(c, e)
                   });

// ---------------------------------------------------------------------


const story_selection = (e) => {
    // make story_num_selector and story_title_selector values the same
    if (e.target.id == "story_dropdown_by_number") {
        story_title_selector.value = story_num_selector.value;
    }
    else {
        story_num_selector.value = story_title_selector.value;
    }
    // if "number" or "title" options ("story00") are selected
    if (story_num_selector.value == "story00") {
        document.getElementById("annotation_navigation").style.display = "none";
        handle_canvas.blank_canvas();
        return;
    }
    else {
        // assign the annotations according to the selected story
        get_annotations(story_num_selector.value);
        current_story_num = story_num_selector.value;
        current_page_num = 0;
        total_num_pages = story_page_lengths_by_name[current_story_num];
        handle_canvas.put_comic_page_on_canvas(current_story_num, current_page_num);
        reset();
        document.getElementById("annotation_navigation").style.display = "block";
        page_counter.innerHTML = "Page " + (current_page_num+1) + " of " + total_num_pages;
        
    }
}; // end of const story_selection

// Event handlers:
story_num_selector.addEventListener('change', story_selection);
story_title_selector.addEventListener('change', story_selection);


// Page Navigation --------------------------------

// Global variables:

const next_page_button = document.getElementById("next_page_button");
const previous_page_button = document.getElementById("previous_page_button");

// Functions:

function reset() {
    // turn off all switches
    bounding_box_panels_on_canvas = false;
    polygon_panels_on_canvas = false;
    agent_polygons_on_canvas = false;
    text_sections_on_canvas = false;
    bounding_box_panel_ids_on_canvas = false;
    polygon_panel_ids_on_canvas = false;
    agent_ids_on_canvas = false;
    agent_refs_on_canvas = false;
    agent_attributes_are_displayed = false;
    text_section_ids_on_canvas = false;
    text_section_attributes_are_displayed = false;
    
    // reset and/or hide appropriate buttons
    // panels
    show_bounding_box_panels_button.innerHTML = "Show Bounding Box Panels";
    show_bounding_box_panels_Ids_button.innerHTML = "Show IDs";
    show_bounding_box_panels_Ids_button.style.display = "none";
    show_polygon_panels_button.innerHTML = "Show Polygon Panels";
    show_polygon_panels_Ids_button.innerHTML = "Show IDs";
    show_polygon_panels_Ids_button.style.display = "none";
    // agents
    show_polygon_agents_button.innerHTML = "Show Agents";
    agents_show_ids_button.innerHTML = "Show IDs";
    agents_show_refs_button.innerHTML = "Show Referents";
    agents_show_attributes_button.innerHTML = "Show Attributes";
    agents_buttons_container.style.display = "none";
    // text sections
    show_text_sections_button.innerHTML = "Show Text Sections";
    text_sections_show_ids_button.innerHTML = "Show IDs";
    text_sections_show_attributes_button.innerHTML = "Show Attributes";
    text_sections_buttons_containter.style.display = "none";
    // settings
    show_settings_attributes_button.innerHTML = "Show Attributes";
    settings_attributes_container.style.display = "none";
    // clear all shapes and attributes
    handle_shapes.remove_shapes();
    handle_attributes.remove_attribute_forms();

}; // end of reset()


const page_navigation = (e) => {
    // increment the current_page_num variable
    if (e.target.id == "next_page_button") {
        current_page_num += 1;
        if (current_page_num > (all_comic_page_images[current_story_num].length-1)) {
            current_page_num -= 1;
            return;
        } else {
            reset();
            handle_canvas.put_comic_page_on_canvas(current_story_num, current_page_num);
        }
    } else {
        current_page_num -= 1;
        if (current_page_num == -1) {
            current_page_num += 1;
            return;
        } else {
            reset();
            handle_canvas.put_comic_page_on_canvas(current_story_num, current_page_num);
        }
    }
    page_counter.innerHTML = "Page " + (current_page_num+1) + " of " + total_num_pages;
}; // end of const page_navigation

// Event handlers:
next_page_button.addEventListener('click', page_navigation);
previous_page_button.addEventListener('click', page_navigation);


// Shape Handling -------------------------------

// Global variables:

// switches to track which shapes are presently drawn on canvas
var bounding_box_panels_on_canvas = false;
var polygon_panels_on_canvas = false;
var agent_polygons_on_canvas = false;
var text_sections_on_canvas = false;

// switches to track which ids are presently drawn on canvas
var bounding_box_panel_ids_on_canvas = false;
var polygon_panel_ids_on_canvas = false;
var agent_ids_on_canvas = false;
var agent_refs_on_canvas = false;
var text_section_ids_on_canvas = false;

// Functions:

var handle_shapes = {
    
    run_through_shape_switches: function() {
        this.remove_shapes();
        // Panels:
        var panels = annotations["page"+(current_page_num+1)];
        // bounding box panels
        if (bounding_box_panels_on_canvas) {
            console.log("bounding boxes on canvas");
            for (var i=0; i<Object.keys(panels).length; i++) {
                var bounding_box_coords = panels["panel" + (i+1)]["panel_shape"]["bounding_box"]["coords"];
                this.draw_shapes(bounding_box_coords, "#B22222");
                if (bounding_box_panel_ids_on_canvas == true) {
                    this.add_id_nums_in_circle(panels["panel" + (i+1)]["id"], bounding_box_coords[0], "#B22222");
                }
            }
        } // end of (bounding_box_panels_on_canvas)
        
        // polygon panels
        if (polygon_panels_on_canvas) {
            console.log("polygon panels on canvas");
            for (var i=0; i<Object.keys(panels).length; i++) {
                var polygon_coords = panels["panel" + (i+1)]["panel_shape"]["polygon"]["coords"];
                this.draw_shapes(polygon_coords, "#FF0000");
                if (polygon_panel_ids_on_canvas == true) {
                    this.add_id_nums_in_circle(panels["panel" + (i+1)]["id"], polygon_coords[0], "#FF0000");
                }
            }
        } // end of if (polygon_panels_on_canvas == true)
        
        // Agents:
        if (agent_polygons_on_canvas) {
            console.log("agents on canvas");
            for (var i=0; i<Object.keys(panels).length; i++) {
                var agents = panels["panel" + (i+1)]["agents"];
                for (var j=0; j<Object.keys(agents).length; j++) {
                    var agent_coords = agents["agent" + (j+1)]["agent_shape"]["polygon"]["coords"];
                    this.draw_shapes(agent_coords, "#C942FF");
                    if (agent_ids_on_canvas == true) {
                        this.add_id_nums_in_circle(agents["agent" + (j+1)]["id"], agent_coords[0], "#C942FF");
                    }
                    if (agent_refs_on_canvas == true) {
                        this.add_id_nums_in_circle(agents["agent" + (j+1)]["referent"], agent_coords[0], "#C942FF");
                    }
                }
            }
        } // end of if (agent_polygons_on_canvas)
        
        // Text sections:
        if (text_sections_on_canvas) {
            for (var i=0; i<Object.keys(panels).length; i++) {
                var text_sections = panels["panel" + (i+1)]["text_sections"];
                for (var j=0; j<Object.keys(text_sections).length; j++) {
                    var text_section_coords = text_sections["text_section" + (j+1)]["text_section_shape"]["bounding_box"]["coords"];
                    this.draw_shapes(text_section_coords, "#1BE300");
                    if (text_section_ids_on_canvas == true) {
                        this.add_id_nums_in_circle(text_sections["text_section" + (j+1)]["id"], text_section_coords[0], "#1BE300");
                    }
                }
            }
        } // end of if (text_sections_on_canvas)
        
    }, // end of run_through_shape_switches: function()
    
    draw_shapes: function(coordinates, fill_color) {
        canvas = document.getElementById("canvas");
        context = canvas.getContext("2d");
        context.lineWidth = 3;
        context.strokeStyle = fill_color;
        
        context.beginPath();
        context.moveTo(coordinates[0][0], coordinates[0][1]);
        for(var i=1; i<coordinates.length; i++) {
            context.lineTo(coordinates[i][0], coordinates[i][1]);
        }
        context.closePath();
        context.stroke();
        fill_color = "";
    }, // end of draw_shapes: function(coordinates)
    
    remove_shapes: function() {
        handle_canvas.put_comic_page_on_canvas(current_story_num, current_page_num);
    },
    
    add_id_nums_in_circle: function(shape_id, first_coord, fill_color) {
        context.beginPath();
        context.arc(first_coord[0], first_coord[1], 15, 0, Math.PI * 2, true);
        context.closePath();
        context.fillStyle = fill_color;
        context.fill();
        context.beginPath();
        context.fillStyle = "white";
        context.font = "15px Arial Black";
        context.fillText(shape_id.toString(), first_coord[0]-5, first_coord[1]+5);
    }
    
}; // end of var handle_shapes object


// Attribute Handling ---------------------------

// Global variables:

var agent_attributes_forms_section = document.getElementById("agent_attributes_forms_section");
var agent_template_panel_form = document.getElementById("agent_template_panel_form");
var agent_template_attribute_form = document.getElementById("agent_template_attribute_form");
var text_section_attributes_form_section = document.getElementById("text_section_attributes_form_section");
var text_section_template_panel_form = document.getElementById("text_section_template_panel_form");
var text_section_template_attribute_form = document.getElementById("text_section_template_attribute_form");
var settings_attributes_form_section = document.getElementById("settings_attributes_form_section");
var settings_template_panel_form = document.getElementById("settings_template_panel_form");
var settings_template_attribute_form = document.getElementById("settings_template_attribute_form");



// switches to track which attribute forms are currently being shown
var agent_attributes_are_displayed = false;
var text_section_attributes_are_displayed = false;
var settings_attributes_are_displayed = false;


// Functions:
var handle_attributes = {
    
    run_through_attribute_switches: function() {
        this.remove_attribute_forms();
        var panels = annotations["page"+(current_page_num+1)];
        
        // Agent attributes
        if (agent_attributes_are_displayed) {
            console.log("agent attributes initialized");
            for (var i=0; i<Object.keys(panels).length; i++) {
                var new_agent_template_panel_form = agent_template_panel_form.cloneNode(true);
                new_agent_template_panel_form.id = "agent_template_panel_form"+current_page_num+"."+(i+1);
                new_agent_template_panel_form.children[0].innerHTML = "Panel "+(i+1);
                var agents = panels["panel" + (i+1)]["agents"];
                for (var j=0; j<Object.keys(agents).length; j++) {
                    var individual_agent_attribute_form = this.generate_agent_attribute_form((i+1), agents["agent"+(j+1)]["id"], agents["agent"+(j+1)]["referent"], agents["agent"+(j+1)]["introduced_coreferent"], agents["agent"+(j+1)]["animacy_type"]);
                    individual_agent_attribute_form.style.display = "inline-block"; 
                    new_agent_template_panel_form.appendChild(individual_agent_attribute_form);
                } // end of for (var j=0; j<Object.keys(agents).length; j++)
                new_agent_template_panel_form.style.display = "block";
                agent_attributes_forms_section.appendChild(new_agent_template_panel_form);
            } // end of for (var i=0; i<Object.keys(panels).length; i++)
            agent_attributes_forms_section.style.display = "block";
        } // end of if (agent_attributes_are_displayed)
        
        // Text section attributes
        if (text_section_attributes_are_displayed) {
            console.log("text section attributes initialized");
            for (var i=0; i<Object.keys(panels).length; i++) {
                var new_text_section_template_panel_form = text_section_template_panel_form.cloneNode(true);
                new_text_section_template_panel_form.id = "text_section_template_panel_form"+current_page_num+"."+(i+1);
                new_text_section_template_panel_form.children[0].innerHTML = "Panel"+(i+1);
                new_text_section_template_panel_form.style.display = "block";
                var text_sections = panels["panel" + (i+1)]["text_sections"];
                for (var j=0; j<Object.keys(text_sections).length; j++) {
                    var individual_text_section_attribute_form = this.generate_text_section_attribute_form((i+1), text_sections["text_section"+(j+1)]["id"], text_sections["text_section"+(j+1)]["type"], text_sections["text_section"+(j+1)]["speaker_referent"]);
                    
                    individual_text_section_attribute_form.style.display = "inline-block";
                new_text_section_template_panel_form.appendChild(individual_text_section_attribute_form);
                } // end offor (var j=0; j<Object.keys(text_sections).length; j++)
                text_section_attributes_form_section.appendChild(new_text_section_template_panel_form);
            } // end of for (var i=0; i<Object.keys(panels).length; i++)
            text_section_attributes_form_section.style.display = "block";
        } // if (text_section_attributes_are_displayed)
        
        if (settings_attributes_are_displayed) {
            console.log("settings attributes initialized");
            for (var i=0; i<Object.keys(panels).length; i++) {
                new_settings_template_panel_form = settings_template_panel_form.cloneNode(true);
                new_settings_template_panel_form.id = "new_settings_template_panel_form"+current_page_num+"."+(i+1);
                new_settings_template_panel_form.children[0].innerHTML = "Panel " +(i+1);
                var new_settings_template_attribute_form = settings_template_attribute_form.cloneNode("true");
                new_settings_template_attribute_form.id = "settings_template_attribute_form"+current_page_num+"."+(i+1);
                new_settings_template_attribute_form.children[0].innerHTML = "Location Referent: " + panels["panel"+(i+1)]["setting"]["location_referent"];
                new_settings_template_attribute_form.children[1].innerHTML = "Location Information Amount (ordinal): " + panels["panel"+(i+1)]["setting"]["location_information_amount_ordinal"];
                new_settings_template_attribute_form.children[2].innerHTML = "Location Information Amount (binary): " + panels["panel"+(i+1)]["setting"]["location_information_amount_binary"]
                new_settings_template_attribute_form.style.display = "inline-block";
                new_settings_template_panel_form.appendChild(new_settings_template_attribute_form);
                settings_attributes_form_section.appendChild(new_settings_template_panel_form);
                settings_attributes_form_section.style.display = "block";
                }
        } // if (settings_attributes_are_displayed)
        
        
    }, // end of run_through_attribute_switches: function()
    
    generate_agent_attribute_form: function(panel_num, id, ref, coref, anim) {
         //clone the agent_template_attribute_form
        var new_agent_attribute_form = agent_template_attribute_form.cloneNode(true);
        // create and attach a new id to the form, page/panel/agent
        new_agent_attribute_form.id = "agent_attribute_form"+current_page_num+"."+panel_num+"."+id;
        // fill out the new forms
        new_agent_attribute_form.children[0].innerHTML = "Id: " + id;
        new_agent_attribute_form.children[1].innerHTML = "Referent: " + ref;
        new_agent_attribute_form.children[2].innerHTML = "Coref: " + coref;
        new_agent_attribute_form.children[3].innerHTML = "Animacy: " + anim;
        //new_agent_attribute_form.style.display = "inline-block";
        // return the new form object
        return new_agent_attribute_form;
        
    },
    
    generate_text_section_attribute_form: function(panel_num, id, type, speaker) {
        // clone the text_section_template_attribute_form
        var new_text_section_template_attribute_form = text_section_template_attribute_form.cloneNode(true);
        // create and attach new id to the form
        new_text_section_template_attribute_form.id = "text_section_template_attribute_form"+current_page_num+"."+panel_num+"."+id;
        // fill out the new forms
        new_text_section_template_attribute_form.children[0].innerHTML = "Id: " + id;
        new_text_section_template_attribute_form.children[1].innerHTML = "Type: " + type;
        new_text_section_template_attribute_form.children[2].innerHTML = "Speaker: " + speaker;
        // return the new form object
        return new_text_section_template_attribute_form;
    },
    
    remove_attribute_forms: function() {
        console.log("attributes are removed");
        // agents:
        while (agent_attributes_forms_section.children.length > 1) {
            agent_attributes_forms_section.removeChild(agent_attributes_forms_section.lastChild);
        }
        agent_attributes_forms_section.style.display = "none";
        // text sections:
        while (text_section_attributes_form_section.children.length > 1) {
            text_section_attributes_form_section.removeChild(text_section_attributes_form_section.lastChild);
        }
        text_section_attributes_form_section.style.display = "none";
        // settings
        while (settings_attributes_form_section.children.length > 1) {
            settings_attributes_form_section.removeChild(settings_attributes_form_section.lastChild);
        }
    } // end of remove_attribute_forms: function()
    
}; // end of handle_attributes Object



// Panel Navigation -------------------------

// Global variables:

const show_bounding_box_panels_button = document.getElementById("show_bounding_box_panels_button");
const show_polygon_panels_button = document.getElementById("show_polygon_panels_button");
const show_bounding_box_panels_Ids_button = document.getElementById("show_bounding_box_panels_Ids");
const show_polygon_panels_Ids_button = document.getElementById("show_polygon_panels_Ids");

// Functions:

const handle_panels = (e) => {

    // Bounding boxes
    if (e.target.id == "show_bounding_box_panels_button") {
        if (e.target.innerHTML == "Remove Bounding Box Panels") {
            bounding_box_panels_on_canvas = false;
            handle_shapes.run_through_shape_switches();
            e.target.innerHTML = "Show Bounding Box Panels";
            show_bounding_box_panels_Ids_button.style.display = "none";
        } else {
            bounding_box_panels_on_canvas = true;
            handle_shapes.run_through_shape_switches();
            e.target.innerHTML = "Remove Bounding Box Panels"
            show_bounding_box_panels_Ids_button.style.display = "block";
        }
    }
    
    // Polygons
    if (e.target.id == "show_polygon_panels_button") {
        if (e.target.innerHTML == "Remove Polygon Panels") {
            polygon_panels_on_canvas = false;
            handle_shapes.run_through_shape_switches();
            e.target.innerHTML = "Show Polygon Panels";
            show_polygon_panels_Ids_button.style.display = "none";
        } else {
            polygon_panels_on_canvas = true;
            handle_shapes.run_through_shape_switches();
            e.target.innerHTML = "Remove Polygon Panels";
            show_polygon_panels_Ids_button.style.display = "block";
        }
    }
    
    // Bounding box Ids
    if (e.target.id == "show_bounding_box_panels_Ids") {
        // if the button says "Remove IDs",
        if (e.target.innerHTML == "Remove IDs") {
            bounding_box_panel_ids_on_canvas = false;
            handle_shapes.run_through_shape_switches();
            e.target.innerHTML = "Show IDs"
        } else {
            bounding_box_panel_ids_on_canvas = true;
            handle_shapes.run_through_shape_switches();
            e.target.innerHTML = "Remove IDs"
        }
    }
    
    // Polygon Ids
    if (e.target.id == "show_polygon_panels_Ids") {
        if (e.target.innerHTML == "Remove IDs") {
            polygon_panel_ids_on_canvas = false;
            handle_shapes.run_through_shape_switches();
            e.target.innerHTML = "Show IDs"
        } else {
            polygon_panel_ids_on_canvas = true;
            handle_shapes.run_through_shape_switches();
            e.target.innerHTML = "Remove IDs"
        }
    }
    
}; // end of const draw_panels


// Event handlers:
show_bounding_box_panels_button.addEventListener('click', handle_panels);
show_polygon_panels_button.addEventListener('click', handle_panels);
show_bounding_box_panels_Ids_button.addEventListener('click', handle_panels);
show_polygon_panels_Ids_button.addEventListener('click', handle_panels);



// Agent Navigation ----------------------------

// Global variables:

const show_polygon_agents_button = document.getElementById("show_polygon_agents_button");
const agents_buttons_container = document.getElementById("agents_buttons_container");
const agents_show_ids_button = document.getElementById("agents_show_ids_button");
const agents_show_refs_button = document.getElementById("agents_show_refs_button");
const agents_show_attributes_button = document.getElementById("agents_show_attributes_button");
const agent_attributes_container = document.getElementById("agent_attributes_container");

// Functions:

const handle_agents = (e) => {
    
    // Agent outlines
    if (e.target.id == "show_polygon_agents_button") {
        if (e.target.innerHTML == "Remove Agents") {
            agent_polygons_on_canvas = false;
            handle_shapes.run_through_shape_switches();
            e.target.innerHTML = "Show Agents";
            agents_buttons_container.style.display = "none";
            // remove attributes
            agent_attributes_are_displayed = false;
            handle_attributes.run_through_attribute_switches();
            agents_show_attributes_button.innerHTML = "Show Attributes";
        } else {
            agent_polygons_on_canvas = true;
            handle_shapes.run_through_shape_switches();
            e.target.innerHTML = "Remove Agents"
            agents_buttons_container.style.display = "block";
        }
    }
    
    // Agent ids
    if (e.target.id == "agents_show_ids_button") {
        if (e.target.innerHTML == "Remove IDs") {
            agent_ids_on_canvas = false;
            handle_shapes.run_through_shape_switches();
            e.target.innerHTML = "Show IDs";
        } else {
            agent_ids_on_canvas = true;
            agent_refs_on_canvas = false;
            handle_shapes.run_through_shape_switches();
            e.target.innerHTML = "Remove IDs";
            agents_show_refs_button.innerHTML = "Show Referents";
        }
    }
    
    // Agent refs
    if (e.target.id == "agents_show_refs_button") {
        if (e.target.innerHTML == "Remove Referents") {
            agent_refs_on_canvas = false;
            handle_shapes.run_through_shape_switches();
            e.target.innerHTML = "Show Referents";
        } else {
            agent_refs_on_canvas = true;
            agent_ids_on_canvas = false;
            handle_shapes.run_through_shape_switches();
            e.target.innerHTML = "Remove Referents";
            agents_show_ids_button.innerHTML = "Show IDs";
        }
    }
    
    // Agent attributes
    if (e.target.id == "agents_show_attributes_button") {
        if (e.target.innerHTML == "Remove Attributes") {
            agent_attributes_are_displayed = false;
            handle_attributes.run_through_attribute_switches();
            e.target.innerHTML = "Show Attributes";
            agent_attributes_container.style.display = "none";
        } else {
            agent_attributes_are_displayed = true;
            handle_attributes.run_through_attribute_switches();
            e.target.innerHTML = "Remove Attributes";
            agent_attributes_container.style.display = "block";
        }
    }
    
}; // end of const handle_agents


// Event handlers:
show_polygon_agents_button.addEventListener('click', handle_agents);
agents_show_ids_button.addEventListener('click', handle_agents);
agents_show_refs_button.addEventListener('click', handle_agents);
agents_show_attributes_button.addEventListener('click', handle_agents);


// Text Section Navigation -------------------------

// Global variables:
const show_text_sections_button = document.getElementById("show_text_sections_button");
const text_sections_buttons_containter = document.getElementById("text_sections_buttons_containter");
const text_sections_show_ids_button = document.getElementById("text_sections_show_ids_button");
const text_sections_show_attributes_button = document.getElementById("text_sections_show_attributes_button");

// Functions:

const handle_text_sections = (e) => {
    
    // Text section outlines
    if (e.target.id == "show_text_sections_button") {
        if (e.target.innerHTML == "Remove Text Sections") {
            text_sections_on_canvas = false;
            handle_shapes.run_through_shape_switches();
            e.target.innerHTML = "Show Text Sections";
            text_sections_buttons_containter.style.display = "none";
            // remove attributes
            text_section_attributes_are_displayed = false;
            handle_attributes.run_through_attribute_switches();
            text_sections_show_attributes_button.innerHTML = "Show Attributes";
        } else {
            text_sections_on_canvas = true;
            handle_shapes.run_through_shape_switches();
            e.target.innerHTML = "Remove Text Sections";
            text_sections_buttons_containter.style.display = "block";
        }
    }
    
    // Text section ids
    if (e.target.id == "text_sections_show_ids_button") {
        if (e.target.innerHTML == "Remove IDs") {
            text_section_ids_on_canvas = false;
            handle_shapes.run_through_shape_switches();
            e.target.innerHTML = "Show IDs";
        } else {
            text_section_ids_on_canvas = true;
            handle_shapes.run_through_shape_switches();
            e.target.innerHTML = "Remove IDs";
        }
    }
    
    // Text section attributes
    if (e.target.id == "text_sections_show_attributes_button") {
        if (e.target.innerHTML == "Remove Attributes") {
            text_section_attributes_are_displayed = false;
            handle_attributes.run_through_attribute_switches();
            e.target.innerHTML = "Show Attributes";
        } else {
            text_section_attributes_are_displayed = true;
            handle_attributes.run_through_attribute_switches();
            e.target.innerHTML = "Remove Attributes";
        }
    }

}; // end of var handle_text_sections


// Event handlers:
show_text_sections_button.addEventListener('click', handle_text_sections);
text_sections_show_ids_button.addEventListener('click', handle_text_sections);
text_sections_show_attributes_button.addEventListener('click', handle_text_sections);

// Setting Navigation -------------------------

// Global variables:
const show_settings_attributes_button = document.getElementById("show_settings_attributes_button");
const settings_attributes_container = document.getElementById("settings_attributes_container");

// Functions:

const handle_settings = (e) => {
    
    if (e.target.innerHTML == "Remove Attributes") {
        settings_attributes_are_displayed = false;
        handle_attributes.run_through_attribute_switches();
        e.target.innerHTML = "Show Attributes";
        settings_attributes_container.style.display = "none";
    } else {
        settings_attributes_are_displayed = true;
        handle_attributes.run_through_attribute_switches();
        e.target.innerHTML = "Remove Attributes"
        settings_attributes_container.style.display = "block";
    }
    
}; // handle_settings

// Event handlers:
show_settings_attributes_button.addEventListener('click', handle_settings);





