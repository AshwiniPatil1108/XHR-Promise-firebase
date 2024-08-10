const cl = console.log;

const postForm = document.getElementById("postForm");
const postContainer  = document.getElementById("postContainer");
const titleControl = document.getElementById("title");
const contentControl = document.getElementById("content");
const userId = document.getElementById("userId");
const submitBtn = document.getElementById("submitBtn");
const updateBtn = document.getElementById("updateBtn");
const loader = document.getElementById("loader");

const BASE_URL =`https://promise-post-default-rtdb.asia-southeast1.firebasedatabase.app/`;

const POST_URL =`${BASE_URL}/posts.json`;

let postArr =[]; 

const sweetAlert =(msg, icon)=>{
    Swal.fire({
        title: msg,
        timer: 2500,
        icon: icon
    })
}

const templating = (arr)=>{
    postContainer.innerHTML= arr.map(post =>{
        return `
                <div class="col-md-4 mb-3">
                    <div class="card postcard h-100" id = "${post.id}">
                        <div class="card-header">
                            <h3 class="m-0">${post.title}</h3>
                        </div>
                        <div class="card-body">
                            <p class="m-0">
                              ${post.body}
                            </p>
                        </div>
                        <div class="card-footer d-flex justify-content-between">
                            <button onClick="onEdit(this)" class="btn btn-outline-primary btn-sm">Edit</button>
                            <button onClick="onDelete(this)"class="btn btn-outline-danger btn-sm">Remove</button>
                        </div>
                    </div>
                </div>
        `
    }).join("");
}



//1st 

const makeApiCall =(methodName, api_url, msgBody = null)=>{
    loader.classList.remove("d-none")
    return new Promise((resolve, reject) => {
        let xhr = new XMLHttpRequest();
        
        xhr.open(methodName, api_url);
        
        xhr.onload = function(){
            if(xhr.status >= 200 && xhr.status <300){
                let data = JSON.parse(xhr.response)
                resolve(data)
            }else{
                reject(`Something went wrong!!!!`)
            }
            loader.classList.add("d-none")
        }
        xhr.onerror = function(){
            loader.classList.add(`d-none`)
        }

        xhr.send(JSON.stringify(msgBody))
    })
}


const fetchposts = () =>{
    makeApiCall("GET", POST_URL)//3rd
    .then(res =>{
        cl(res)
        let postsArr =[];
        for(const key in res){
            let  obj = {...res[key], id:key};
           
            postsArr.push(obj);
            cl(postsArr);
        }  
        templating(postsArr)
        //we will decide cb here
    })
    .catch(err =>{
        cl(err)
    })
    
}
fetchposts()



//2nd
const onPostSubmit = (eve)=>{
    eve.preventDefault();
    let newpost ={
        title:titleControl.value,
        body:contentControl.value,
        userId:userId.value,
    }
    cl(newpost);

    makeApiCall("POST", POST_URL, newpost)
        .then(res =>{
            cl(res)
            //create card
            newpost.id = res.name;
            let card = document.createElement("div");
            card.className ="col-md-4 mb-3";
        
            card.innerHTML =`
                     <div class="card postcard h-100" id = "${newpost.id}">
                        <div class="card-header">
                            <h3 class="m-0">${newpost.title}</h3>
                        </div>
                        <div class="card-body">
                            <p class="m-0">
                              ${newpost.body}
                            </p>
                        </div>
                        <div class="card-footer d-flex justify-content-between">
                            <button onClick="onEdit(this)" class="btn btn-outline-primary btn-sm">Edit</button>
                            <button onClick="onDelete(this)"class="btn btn-outline-danger btn-sm">Remove</button>
                        </div>
                    </div>
            `
                postContainer.prepend(card);
                sweetAlert(`${newpost.title} is added successfully`, "success")
        })
        .catch(err =>{
            cl(err)
        })
        .finally(()=>{
            postForm.reset();
            loader.classList.add("d-none")
        })
        
}
//4th
const onEdit =(ele)=>{
    cl(ele)
    let editId =ele.closest('.card').id;
    localStorage.setItem("editId", editId)
    cl(editId);
    //api url
    let EDIT_URL =`${BASE_URL}/posts/${editId}.json`

    makeApiCall("GET", EDIT_URL)
    .then(res =>{
        cl(res)
        titleControl.value = res.title;
        contentControl.value = res.body;
        userId.value= res.userId;

        submitBtn.classList.add("d-none");
        updateBtn.classList.remove("d-none");
        window.scrollTo(0,0,"smooth")
    })
    .catch(err =>{
        cl(err)
    })
    .finally(()=>{
        
        loader.classList.add("d-none")
    })
}

//5
const onPostUpdate= ()=>{
    // updated id
    let UPDATED_ID  =localStorage.getItem("editId");
    cl(UPDATED_ID) 
    
    //api url

    let UPDATED_URL = `${BASE_URL}/posts/${UPDATED_ID}.json`

    //updated obj
    let UPDATED_OBJECT ={
        title:titleControl.value,
        body:contentControl.value,
        userId:userId.value,
    }
    cl(UPDATED_OBJECT );
    postForm.reset();



    //api call to update data
    makeApiCall("PATCH", UPDATED_URL, UPDATED_OBJECT)
    .then(res =>{
        cl(res)
        let card = [...document.getElementById(UPDATED_ID).children];
        cl(card)
        card[0].innerHTML = `<h3 class="m-0">${UPDATED_OBJECT.title}</h3>`
        card[1].innerHTML = `<p class="m-0">${UPDATED_OBJECT.body}</p>`
        sweetAlert(`${UPDATED_OBJECT.title} is updated successfully`, "success")
        
        submitBtn.classList.remove("d-none");
        updateBtn.classList.add("d-none");
    })
    .catch(err =>{
        sweetAlert(err, "error")
    })
    .finally(()=>{
        postForm.reset();
        loader.classList.add("d-none")
    })
    // cl back fun updated on ui
}

const onDelete = (ele) =>{

    Swal.fire({
        title: "Are you sure?",
        text: "You won't to removed this post!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, remove it!"
      }).then((result) => {
        if (result.isConfirmed) {
            //removeId
            let removeId = ele.closest(`.card`).id;

            //removeURL

            let REMOVE_URL = `${BASE_URL}/posts/${removeId}.json`
            //API call
            makeApiCall("DELETE", REMOVE_URL)
            .then(res =>{
                ele.closest(`.card`).parentElement.remove()
            })
            .catch(err =>{
                cl(err)
            })

        }
      });
}


postForm.addEventListener("submit", onPostSubmit);
updateBtn.addEventListener("click", onPostUpdate)