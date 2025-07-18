import { cloudinaryCloudname,sightengine_listID, sightengine_api_user, sightengine_api_secret, sightengine_workflow } from "./keys.js";

export let downloadableLink = null;

export async function contentFilterText(textInput){
  let data = new FormData();
  data.append('text', textInput);
  data.append('lang', 'en');
  data.append('opt_countries', 'us,gb,fr');
  data.append('mode', 'rules');
  data.append('list', sightengine_listID);
  data.append('api_user', sightengine_api_user);
  data.append('api_secret', sightengine_api_secret);


  try {
    const response = await axios({
        url: 'https://api.sightengine.com/1.0/text/check.json',
        method: 'post',
        data: data
    });

    if (response.data.profanity.matches.length > 0 || response.data.blacklist.matches.length > 0) {
        return 0;
    } else {
        return 1; 
    }
} catch (error) {
    console.error("Error in contentFilterText:", error);
    throw error; 
}
}

export async function toBase64(blobURL){
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = function () {
        const base64 = reader.result;
        resolve(base64);
    };
    reader.onerror = function (error) {
        reject(error);
    };
    reader.readAsDataURL(blobURL);
});
}

export function uploadFile(file) {
  return new Promise((resolve, reject) => {
    const url = `https://api.cloudinary.com/v1_1/${cloudinaryCloudname}/upload`;
    const fd = new FormData();
    fd.append('upload_preset', 'jb97dxcc');
    fd.append('file', file);

    fetch(url, {
        method: 'POST',
        body: fd,
    })
    .then((response) => {
        if (!response.ok) {
            throw new Error('Failed to upload file');
        }
        return response.json();
    })
    .then((data) => {
        let url = data.secure_url;
        filterImage(url).then((response) => {
          if(response.data.summary.action == 'reject'){
            url = "../../static/asset/bam.svg";
            resolve(url);
            downloadableLink = null;
          }else{
            resolve(url);
            downloadableLink = file;

          }
        }); 
    })
    .catch((error) => {
        console.error('Error uploading the file:', error);
        reject(error); 
    });
});
}

export async function filterImage(url){
   let response = await axios.get('https://api.sightengine.com/1.0/check-workflow.json', {
    params: {
      'url': url,
      'workflow': sightengine_workflow,
      'api_user': sightengine_api_user,
      'api_secret': sightengine_api_secret,
      'list': sightengine_listID
    }
  })
  return response; 
}


export function stopAtLastPeriod(str){
  let indexOf = str.lastIndexOf(".");
  if(indexOf != -1){
    str = str.substring(0, indexOf+1); 
  }
  return str; 
}

export function removeBlankLines(str){
  let CR = 13; 
  let LF = 10; 
  let regex = /^[a-zA-z0-9\s,.]*$/
  let temp = "";
  for(let i = 0; i< str.length; i++){
    if(regex.test(str[i]) && str[i].charCodeAt(0) != CR && str[i].charCodeAt(0) != LF){
      temp += str[i]
    }
  }
  return temp; 
}