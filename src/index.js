import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';

const APP_STARTUP_TIME = 'app_startup_time';

console.time(APP_STARTUP_TIME);

const API = 'https://acme-users-api-rev.herokuapp.com/api';

const fetchUser = async ()=> {
  const storage = window.localStorage;
  const userId = storage.getItem('userId');
  if(userId){
    try {
      return (await axios.get(`${API}/users/detail/${userId}`)).data;
    }
    catch(ex){
      storage.removeItem('userId');
      return fetchUser();
    }
  }
  const user = (await axios.get(`${API}/users/random`)).data;
  storage.setItem('userId', user.id);
  return  user;
};


class Companies extends Component {
  state = {
    rating: 0
  }

  render(){
    const {companies, followingCompanies, user} = this.props;

    return (
      <div>
        {
          followingCompanies.map((company, idx) => {
            const companyFilter = companies.filter((comp) => comp.id === company.companyId);
              return (
                <div key={companyFilter[0].id}>
                  <h3>{companyFilter[0].name}</h3>
                  <select value={company.rating} id={companyFilter[0].id} onChange={(ev) => {
                    console.log(followingCompanies, '43');

                    this.state.rating = ev.target.value;
                    followingCompanies[idx].rating = this.state.rating;
                    axios.put(`${API}/users/${user.id}/followingCompanies/${company.id}`, {rating: this.state.rating})

                    this.setState({
                      followingCompanies
                    })
                    
                  }}>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                    <option value="5">5</option>
                  </select> 
                </div>
              )
          })
        }
      </div>
    )
  }
}

class App extends Component {
  state = {
    user: [],
    companies: [],
    followingCompanies: []
  }

  async componentDidMount(){
    const user = await fetchUser();

    const companies = axios.get(`${API}/companies`);
    const followingCompanies = axios.get(`${API}/users/${user.id}/followingCompanies`);    

    Promise.all([companies, followingCompanies])
    .then(res => this.setState({
      user: user,
      companies: res[0].data,
      followingCompanies: res[1].data
    }))

  }
  
  render() {
    const {user, companies, followingCompanies} = this.state;
    
    return (
      <div>
        <h1>Acme Company Follower</h1>
        <h2>You {user.fullName} are following {followingCompanies.length} companies.</h2>
        <Companies user={user} companies={companies} followingCompanies={followingCompanies}/>
      </div>
    );
  }
}

ReactDOM.render(<App />, document.querySelector('#app'), () => {
  console.timeEnd(APP_STARTUP_TIME);
});
