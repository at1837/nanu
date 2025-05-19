frontend
setup xcode
cd frontend/ios
pod install

open frontend.xcworkspace

to run
npm install
npx react-native run-ios

backend
npm install
npm run dev

login id: Patient1
pw: 123

login id: Expert1
pw: 123

Data structure
My data structure is use a Node 
Node = {
  name: string;
  val: boolean;
  children: Node[];
};

Design
my design is first converts the sample JSON on the backend so that parent nodes also contain boolean values (true/false) to reflect the status of their child nodes. On every change, the frontend recalculates the parent node's value based on its children and updates it accordingly. It then sends the updated settings to the backend to save the data, allowing Expert users to sync these boolean settings when they log in.

Performance.
It will be O(n) for update all the parents boolean settings

Enhancements
login, role base user, role checking for security
