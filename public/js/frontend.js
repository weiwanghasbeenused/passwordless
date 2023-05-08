window.onload = () => {
    const submitButton = document.getElementById("submit_email");
    const emailInput = document.getElementById("email_address")
    submitButton.addEventListener("click", handleAuth);
    /** This function submits the request to the server for sending the user a magic link.
     * Params: email address
     * Returns: message
     */
    async function handleAuth(event) {
        // event.preventDefault();
        // let request = new XMLHttpRequest();
        // request.onreadystatechange = function(){
        //     if(request.readyState == 4 && request.status == 200)
        //     {
        //         return message;
        //     }
        // };
        
        // let data = new FormData();
        // data.append('email', emailInput.value);
        // console.log(emailInput.value);
        // request.open("POST", "/login");
        // request.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
        // request.send(data);
    }
};