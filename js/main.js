const API = "https://api.github.com/users/";

const app = Vue.createApp({
  data() {
    return {
      search: null,
      result: null,
      errorFound: false,
      favorites: new Map(),
    }
  },

  computed: {
    isFavorite() {
      return this.favorites.has(this.result.id)
    },
    allFavorites() {
      return Array.from(this.favorites.values())
      // Array.from --> convierte un elemento iterable en un Array
      // .values() --> dado que es un map, este metodo retorna los valores del map
    }
  },

  methods: {
    async doSearch() {
      this.result = this.errorFound = null;
      try {
        const response = await fetch(API + this.search.trim());
        if(!response.ok) throw new Error(`user "${this.search}", not found.`)
        const data = await response.json();
        this.result = data;
      } catch (error) {
        this.errorFound = error;
      } finally {
        this.search = null;
      }
    },

    addFavorite() {
      this.favorites.set(this.result.id, this.result);
      this.updateStorage();
    },
    
    removeFavorite() {
      this.favorites.delete(this.result.id);
      this.updateStorage();
    },

    updateStorage() {
      window.localStorage.setItem('favorites', JSON.stringify(this.allFavorites));
      //converted to string due browser´s local storage can storage strings only
    },

    showFavorite(favorite) {
      this.result = favorite;
    }
  },

  //lifecycle method to get favorites map from local storage
  created() {
    const savedFavorites = JSON.parse(window.localStorage.getItem("favorites"));
    if (savedFavorites?.length) {
      const favoritesStored = new Map(savedFavorites.map(favorite => [favorite.id, favorite])); 
      this.favorites = favoritesStored;
    }
  }
  
})

