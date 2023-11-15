import fetch from "node-fetch";

fetch("https://empleados.appsbecallgroup.com/wp-json/wp/v2/media/4710")
    .then(res => res.json())
    .then(doc => console.log(doc.media_details.sizes.thumbnail.source_url))