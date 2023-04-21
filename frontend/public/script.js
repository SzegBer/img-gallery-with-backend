// ------------- GET DATE in string YYYY-MM-DD format
let date = new Date()
let day = date.getDate()
let month = date.getMonth()+1
let year = date.getFullYear()

if (month < 10) {
  month = `0${month}`
}
if (day < 10) {
  day = `0${day}`
}
let currentDate = `${year}-${month}-${day}`


const swiperWrapper = document.querySelector(".swiper-wrapper");
const formElement = document.querySelector(".upload")

// ------------- Pushing pictures in the swiper
const imagesComponent = (element) => `
  <div class="swiper-slide">
      <p class="${element.id} delete">delete photo<ion-icon class="${element.id} delete" name="trash-outline"></ion-icon></p> 
      <h3>${element.title}</h3>
      <img src="public/imgs${element.url}"/>
      <p>Photographer: ${element.photographer}</p>
      <p>upload date: ${element.uploadDate}</p>
  </div>
`;
// ------------- Swiper
const swiper = new Swiper(".swiper", {
  // Optional parameters
  direction: "horizontal",
  loop: true,

  // Navigation arrows
  navigation: {
    nextEl: ".swiper-button-next",
    prevEl: ".swiper-button-prev",
  },

});

// FETCH - getting ALL picture data  ->  sending them in the swiper
fetch(`/images`)
  .then((res) => res.json())
  .then((data) => {
    data.forEach((element) => {
      swiperWrapper.insertAdjacentHTML("beforeend", imagesComponent(element));
    });
  });

// Upload form event Listener / Fetch POST / Feedback to user
formElement.addEventListener('submit', (e) => {
  e.preventDefault();

  const formData = new FormData()
  formData.append('title', document.querySelector(`input[name='title']`).value)
  formData.append('photographer', document.querySelector(`input[name='photographer']`).value)
  formData.append('image', document.querySelector(`input[name='image']`).files[0])
  formData.append('date', currentDate)

  fetch('/upload', {
    method: 'POST',
    body: formData
  })
  .then(res => {
    if(res.status === 200) {
      return res.json()
    } else {
      console.log("ERROR SAVING FILE")
    }
  })
  .then(resData => {
    document.querySelector('.preview').setAttribute("style", `background-image: url(/public/imgs${resData.url});`)
    swiperWrapper.insertAdjacentHTML("beforeend", imagesComponent(resData));
    document.querySelector('.submit').setAttribute("disabled", "true");
    document.querySelector('.submit').innerHTML = 'Upload finished!'

    setTimeout(() => {
      document.querySelector('.preview').setAttribute("style", `background-image: url();`)
      document.querySelector('.submit').setAttribute("disabled", "false");
      document.querySelector('.submit').innerHTML = 'Upload'
      formElement.reset()
    },2000)
  })
  .catch(err => console.log("Catched error: ", err))
})

// Delete request
swiperWrapper.addEventListener('click', (e) => {

  if(e.target.className.includes("delete")){
    let num = e.target.className.indexOf(" delete")
    let targetClassName = e.target.className
    let id = targetClassName.substring(0,num)
  
    const formData = new FormData()
    formData.append('id', id)
  
    fetch('/delete', {
      method: 'DELETE',
      body: formData
    })
    .then(res => {
      if(res.status === 200) {
        return res.json()
      } else {
        console.log("ERROR DELETING FILE")
      }
    })
    .then(data => {
      swiperWrapper.innerHTML= "";
      imagesComponent(data);
    })
  }
})

