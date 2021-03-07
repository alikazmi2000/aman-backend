const request = require('request');
const initMongo = require('./config/mongo');

initMongo();
const categories = require('./app/models/categories');
const brands = require('./app/models/brands');

let uri = 'https://driplyvapes.com/wp-json/wc/v3/' + 'products/categories?per_page=100';


const mapping = (data) => {
    console.log('mapping');
    try {
        
        let ids = {};
        data.map(item => {
            ids[item.wp_id] = item._id;
        })

        console.log(ids);

        // now updating collection

        let entries = Object.entries(ids);

        entries.map(async item => {
            console.log(item[0])
            console.log(item[1])
            let cond = { parent_wp_id: item[0] }
            console.log(cond)
            // let result = await categories.findOne(cond)
            let result = await categories.update(cond, { $set: { parent: item[1] } })
            console.log(result)
            // categories.updateMany({ parent_wp_id: item[0] }, { $set: {parent: item[1]}})
        })

    } catch (error) {
        console.error(error);
    }

}


const brandsMapping = (data) => {
    console.log('brandsMapping');
    try {
        
        let ids = {};
        data.map(item => {
            ids[item.wp_id] = item._id;
        })

        console.log(ids);

        // now updating collection

        let entries = Object.entries(ids);

        entries.map(async item => {
            console.log(item[0])
            console.log(item[1])
            let cond = { parent_wp_id: item[0] }
            console.log(cond)
            // let result = await categories.findOne(cond)
            let result = await categories.update(cond, { $set: { parent: item[1] } })
            console.log(result)
            // categories.updateMany({ parent_wp_id: item[0] }, { $set: {parent: item[1]}})
        })

    } catch (error) {
        console.error(error);
    }

}


const makecategoriesModel = async (data) => {
    try {
        let arr = data.map(item => {
            // console.log(item.image)
            let obj = {
                name: item.name,
                slug: item.slug,
                description: item.description,
                wp_id: item.id,
                parent_wp_id: item.parent,
                image: null
            }

            if (item.image)
                obj.image = {
                    src: item.image.src ? item.image.src : null,
                    name: item.image.name ? item.image.name : null,
                    alt: item.image.alt ? item.image.alt : null,
                }
            return obj;
        })

        console.log(arr)
        let result = await categories.insertMany(arr);
        console.log('inserted')
        console.log(result.length)

        mapping(result);
    } catch (error) {
        console.log(error);
    }
}


const makeBrandsModel = async (data) => {
    try {
        let arr = data.map(item => {
            // console.log(item.image)
            let obj = {
                term_id: item.term_id,
                name: item.name,
                slug: item.slug,
                term_group: item.term_group,
                term_taxonomy_id: item.term_taxonomy_id,
                taxonomy: item.taxonomy,
                description: item.description,
                // parent: item.parent,
                count: item.count,
                filter: item.filter,
                brand_image: item.brand_image,
                brand_banner: item.brand_banner
            }
            return obj;
        })

        console.log(arr)
        let result = await brands.insertMany(arr);
        console.log('inserted')
        console.log(result.length)

        // brandsMapping(result);
    } catch (error) {
        console.log(error);
    }
}



// let option =  {
//     'auth': {
//       'user': 'ck_3a4a7fb005671655f6368c2dd08aab177138dc9d',
//       'pass': 'cs_46ec2cc4c514fe2fb32af9a5d3c86734b29e201b',
//     //   'sendImmediately': false
//     }
//   };


// request.get(uri, option, (err, response, body) => {

//     body = JSON.parse(body);
//     console.log(body.length)
//     // console.log(body);
//     makeModel(body)
// })

// let body = require('./categories.json');
// makecategoriesModel(body)


let body = require('./brands.json');
makeBrandsModel(body)






