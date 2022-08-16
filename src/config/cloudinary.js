const cloudinary = require('cloudinary')

cloudinary.config({
    cloud_name: 'df9pwbam7',
    api_key: '475129485578474',
    api_secret: '4o7fgI1ixK2NGB--SCti7Z5pUgE'
})

exports.uploads = (file, folder) => {
    return new Promise(resolve => {
        cloudinary.uploader.upload(file, (result) => {
            resolve({
                url: result.url,
                id: result.public_id
            })
        }, {
            resource_type: "auto",
            folder: folder
        })
    })
}