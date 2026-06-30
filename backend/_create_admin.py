import os, django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'cooperadora.settings')
django.setup()

from accounts.models import User

if not User.objects.filter(username='admin').exists():
    u = User.objects.create_superuser('admin', 'admin@test.com', 'admin1234', role=User.ROLE_ADMIN)
    print(f"Usuario creado: {u.username} / admin1234")
else:
    print("Usuario admin ya existe")
