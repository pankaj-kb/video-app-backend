// function trackAge(person, age) {
//     this.person = person
//     this.age = age
// }

// const pankaj = new trackAge("Pankaj", 23.9)
// // console.log(pankaj);

// trackAge.prototype.incrementAge = function () {
//     this.age++
// }

// trackAge.prototype.logPerson = function () {
//     console.log(`Person: ${this.person}, Age: ${this.age}`)
// }

// trackAge.prototype.sayHello = function () {
//     console.log(`Hello ${this.person}`)
// }

// const gaurav = new trackAge("gaurav", 23.7)

// pankaj.incrementAge()
// gaurav.incrementAge()

// gaurav.logPerson()
// pankaj.logPerson()
// pankaj.sayHello()



// String.prototype.truelength = function () {
//     console.log(this);
//     return this.trim().length;
// }

// var myName = "pankaj    ";
// console.log(myName.length)

// console.log(myName.truelength());


// class User {
//     constructor(username) {
//         this.username = username
//     }

//     logMe() {
//         console.log(`${this.username} is Logged in.`)
//     }
// }
// class Guest extends User {
//     constructor(username, email, password) {
//         super(username)
//         this.email = email
//         this.password = password
//     }

//     printMe() {
//         console.log(

//             `from function print me :-  username : ${this.username},
//              email : ${this.email},
//              password : ${this.password}`
//         );
//     }
// }
// const pankaj = new Guest("pankaj", "pan@kaj.com", "123bbab");
// // console.log(pankaj);
// pankaj.printMe();


class User {
    constructor(username, password) {
        this.username = username
        this.password = password
    }

    get password() {
        return `${this._password}pankaj222`.toUpperCase()
    }

    set password(value) {
        this._password = value
    }
}

// const pankaj = new User("pankajkb", "abd23hh22")

const nayan = new User("nayanrai", "abscss")


// console.log(pankaj)
console.log(nayan.password);

