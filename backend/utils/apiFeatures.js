class ApiFeatures {
    constructor(query, queryStr) {
        this.query = query
        this.queryStr = queryStr
    }
    // searching from name field of Product which has a queryStr.keyword as substring (case insensitive)
    search() {
        const keyword = this.queryStr.keyword
            ? {
                name: {
                    $regex: this.queryStr.keyword,
                    $options: "i"
                }
            }
            : {}
        this.query = this.query.find({ ...keyword })
        return this
    }
    /* 
    filtering from category field of product which has a queryStr.category as substring (case sensitive)
    filtering for price and rating
    */
    filter() {
        const queryCopy = { ...this.queryStr }
        const removeFields = ["keyword", "page", "limit"]
        removeFields.forEach((key) => delete queryCopy[key])
        let queryCopyStr = JSON.stringify(queryCopy)
        queryCopyStr = queryCopyStr.replace(/\b(gt|gte|lt|lte)\b/g, (key) => `$${key}`)
        /*
        assumption that queryStr will not contain `"gt"` or `"gte"` or ...  as a substring of key or value, otherwise it will also get replace
        */
        this.query = this.query.find(JSON.parse(queryCopyStr))
        return this
    }
    pagination(resultPerPage) {
        const currentPage = Number(this.queryStr.page) || 1
        const skip = Number(resultPerPage * (currentPage - 1))
        this.query = this.query.limit(resultPerPage).skip(skip)
        return this
    }
}
module.exports = ApiFeatures