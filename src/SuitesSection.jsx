import background from './assets/principal-page/1.png'
function SuitesSection() {
  return (
    <section id='suites'>
      
        <div className="container">
          <div class="row justify-content-evenly">
          
            <div class="col-md-5 card">
              
              <div class="media" >
                <img
                  class="align-self-start img-fluid h-50 w-100 "
                  src={background}
                  alt=""
                ></img>
                <div class="media-body">
                  <h5 class="mt-0">Suite 1</h5>
                  <p>
                    Cras sit amet nibh libero, in gravida nulla. Nulla vel metus
                    scelerisque ante sollicitudin. 
                  </p>
                  <p>
                  Disfruta de una suite exclusiva con TV plana,
                  parqueadero, WiFi 5Ghz. 
                  </p>
                </div>
              </div>
            </div>
            <div class="col-md-5 .ms-auto card ">
              <div class="media">
              <img
                  class="align-self-start img-fluid h-50 w-100"
                  src={background}
                  alt=""
                ></img>
                <div class="media-body">
                  <h5 class="mt-0">Suite 2</h5>
                  <p>
                    Cras sit amet nibh libero, in gravida nulla. Nulla vel metus
                    scelerisque ante sollicitudin. Cras purus odio, vestibulum
                    in vulputate at, tempus viverra turpis. Fusce condimentum
                    nunc ac nisi vulputate fringilla. Donec lacinia congue felis
                    in faucibus.
                  </p>
                  <p>
                    Donec sed odio dui. Nullam quis risus eget urna mollis
                    ornare vel eu leo. Cum sociis natoque penatibus et magnis
                    dis parturient montes, nascetur ridiculus mus.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
  )
}

export default SuitesSection