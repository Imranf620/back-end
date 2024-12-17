class ApiFeatures {
    constructor(query, queryStr) {
      this.query = query;
      this.queryStr = queryStr;
    }
  
    search() {
      if (this.queryStr.keyword) {
        const keyword = this.queryStr.keyword;
        this.query.where.OR = [
          { name: { contains: keyword, mode: "insensitive" } },
          { email: { contains: keyword, mode: "insensitive" } },
        ];
      }
      return this;
    }
  
    filter() {
      if (this.queryStr.role) {
        this.query.where.role = this.queryStr.role.toUpperCase();
      }
      if (this.queryStr.active) {
        this.query.where.active = this.queryStr.active === "true";
      }
      return this;
    }
  
    pagination(resultPerPage) {
      const currentPage = Number(this.queryStr.page) || 1;
      const skip = resultPerPage * (currentPage - 1);
      this.query.skip = skip;
      this.query.take = resultPerPage;
      return this;
    }
  }
  
  export default ApiFeatures;
  