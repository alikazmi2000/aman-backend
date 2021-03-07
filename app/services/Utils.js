class Utils {

    /**
     * @description Get one record based on given condition
     * @param  {object} model - schema information
     * @param  {object} cond - query filter 
     * @param  {object} proj ={} - projection to be used in query
     * @param  {object} sort ={} - sort to be used in query
     * * @param  {number} limit - number of records to limit in query
     * @param  {number} skip - number of records to skip
     * @return {object} - required document
     */
    static sumOfArray(array = []) {
        let total = 0;
        let i = 0
        let len = array.length;
        for (; i < len; i++)
            total += array[i];
        return total;
    }

    static sumOfArrayFields(array = [], key = '', multiplier = '', floatPoint = 2) {
        let sum = array.map(i => {
            return Number(i[key]) * (i[multiplier] || 1)
        });
        return Number(this.sumOfArray(sum).toFixed(floatPoint));
      
    }
}

module.exports = Utils;
