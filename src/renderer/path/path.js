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
    gotoAbsoluteDir(dir){
        if (dir.startsWith('/'))
            dir=dir.slice(1)
        if (dir.endsWith('/'))
            dir=dir.slice(0,-1)
        this.pathArr=dir.split('/')
    }
}
export default Path