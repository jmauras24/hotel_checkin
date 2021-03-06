import React from 'react';
import Webcam from 'react-webcam';
import axios from 'axios';
import { connect } from 'react-redux';
import DateTime from 'react-datetime';

import { createUser } from '../redux/users';
import { createBook } from '../redux/books';
import { createAUser, updateAUser } from '../redux/user';

class Verify extends React.Component {

  constructor(props) {
    super(props)
    this.state = this.states(this.props);
    this.setRef = this.setRef.bind(this);
    this.capture = this.capture.bind(this);
    this.enroll = this.enroll.bind(this);
    this.onChange = this.onChange.bind(this);
    this.onChangeCal = this.onChangeCal.bind(this);
    this.delete = this.delete.bind(this);
  }

  states(props) {
    return {
      gender: '',
      load: false,
      register: false,
      name: '',
      faceId: '',
      room: '',
      startDate: '',
      endDate: '',
    }
  }

  componentWillReceiveProps(nextProps) {
    this.setState(this.states(nextProps))
  }

  setRef(webcam) {
    this.webcam = webcam;
  }

  capture() {
    this.setState({
      load: true
    });

    const imageSrc = this.webcam.getScreenshot();

    axios.post(`https://api.kairos.com/recognize`, {
      gallery_name: "newGallery",
      image: imageSrc,
    }, {
        headers: {
          app_id: '7fe4f3d8',
          app_key: '8a56adee321afe967bf5d6a2d2b5ecef'
        }
      }).then((response) => {
        console.log(response)

        if (response.data.Errors || response.data.images[0].transaction.message === 'no match found') {
          axios.post(`https://api.kairos.com/detect`, {
            gallery_name: "newGallery",
            image: imageSrc,
          }, {
              headers: {
                app_id: '7fe4f3d8',
                app_key: '8a56adee321afe967bf5d6a2d2b5ecef'
              }
            }).then((response) => {
              this.setState({
                load: false,
                gender: response.data.images[0].faces[0].attributes.gender.type,
                register: true,
              });

            })
        } else {
          const faceID = response.data.images[0].transaction.face_id;
          const user = this.props.users.find(user => user.faceId === faceID);

          this.setState({
            load: false
          });
          this.props.updateAUser(user);
          this.props.history.push('/welcome');
        }
      });
  }

  enroll() {
    this.setState({
      load: true
    });

    const imageSrc = this.webcam.getScreenshot();

    axios.post(`https://api.kairos.com/enroll`, {
      gallery_name: "newGallery",
      image: imageSrc,
      subject_id: this.state.name
    }, {
        headers: {
          app_id: '7fe4f3d8',
          app_key: '8a56adee321afe967bf5d6a2d2b5ecef'
        }
      }).then((response) => {
        if (response.data.images) {
          if (response.data.images[0].transaction)
            this.setState({
              faceId: response.data.images[0].transaction.face_id,
              room: 302,
              load: false,
              startDate: new Date()
            })
        }
        const user = {
          name: this.state.name,
          faceId: this.state.faceId
        }
        this.props.createUser(user);
        this.props.createAUser(user);

      }).then( () => {
        const book = {
          startDate: this.state.startDate,
          endDate: this.state.endDate,
          room: this.state.room,
          user_id: 1
        }
        this.props.createBook(book);
        this.props.history.push('/welcome');
      })
  }

  delete() {
    this.setState({
      load: true
    });

    const imageSrc = this.webcam.getScreenshot();
    axios.post(`https://api.kairos.com/gallery/remove`, {
      gallery_name: "newGallery",
    }, {
        headers: {
          app_id: '7fe4f3d8',
          app_key: '8a56adee321afe967bf5d6a2d2b5ecef'
        }
      }).then((response) => {
        console.log(response)
        this.setState({
          load: false,
        })
      }
    )
  }

  onChange(e) {
    this.setState({ [e.target.name]: e.target.value });
  }

  onChangeCal(date) {
    this.setState({ endDate: date._d })
  }

  render() {
    const { register, name, gender } = this.state;
    console.log(this.state)
    return (
      <div className='container-fluid'>
        <button
          onClick={this.delete}
          className='input-group-append btn btn-outline-secondary'
          type='button'
        >delete</button>
        {
          register ? (
            <div>
              <div className='text-center mt-5'>
                <h4>Hello<span className='text-danger'>{gender == 'M' ? ' Sir, ' : ' Ma\'am '}</span>
                  Welcome to our Hotel</h4>
                <h4>Please check in your name and checkout date</h4>
              </div>
              <div className='row'>
                <div className='col-md-4' />
                <Webcam
                  audio={false}
                  height={320}
                  ref={this.setRef}
                  screenshotFormat="image/png"
                  width={480}
                />
              </div>
              <div className='row mt-3'>
                <div className='col-md-4' />
                <div className='col-md-3'>
                  <h5 className='text-center'>Checkout Date</h5>
                  <DateTime
                    dateFormat='YYYY-MM-DD'
                    onChange={this.onChangeCal}
                  />
                </div>
              </div>
              <div className='row mt-3'>
                <div className='input-group col-md-4' />
                <input
                  type='text' className='form-control col-md-3'
                  placeholder='Enter your name' onChange={this.onChange}
                  name='name' value={name}
                />
                <button
                  onClick={this.enroll}
                  className='input-group-append btn btn-outline-secondary'
                  type='button'
                >Create</button>
              </div>

            </div>
          )
            :
            <div>
              <div className='text-center'>
                <h3>Verify</h3>
              </div>
              <div className='row'>
                <div className='col-md-4' />
                <Webcam
                  audio={false}
                  height={320}
                  ref={this.setRef}
                  screenshotFormat="image/png"
                  width={480}
                />
              </div>
              <div className='col-md-5 float-right'>
                <button
                  onClick={this.capture}
                  className='btn btn-outline-secondary mt-2'
                  type='button'
                >Verify</button>
              </div>
            </div>
        }
      </div>
    );
  }
}

const mapStateToProps = ({ users, books }) => {
  return {
    users,
    books
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    createUser: (user) => dispatch(createUser(user)),
    createBook: (book) => dispatch(createBook(book)),
    createAUser: (user) => dispatch(createAUser(user)),
    updateAUser: (user) => dispatch(updateAUser(user))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Verify);

