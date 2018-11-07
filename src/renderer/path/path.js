class Path{
    constructor(pathArr){
        this.pathArr=pathArr
    }
    getPathStr(){
        return '/'+this.pathArr.join('/')+'/'
    }
    getParentDir(){
        return new Path(this.pathArr.slice(0,-1))
    }
    gotoDir(dir){
        this.pathArr.push(dir)
    }
}
export default Path