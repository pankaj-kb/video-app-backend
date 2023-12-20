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



String.prototype.truelength = function () {
    console.log(this);
    return this.trim().length;
}

var myName = "pankaj    ";
console.log(myName.length)

console.log(myName.truelength());
